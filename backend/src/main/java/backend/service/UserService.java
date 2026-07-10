package backend.service;

import backend.dto.AuthResponse;
import backend.dto.LoginRequest;
import backend.dto.ProfileUpdateRequest;
import backend.dto.RegisterRequest;
import backend.model.User;
import backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UserService {

    private static final int OTP_EXPIRY_MINUTES = 10;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailOtpService emailOtpService;
    private final SecureRandom secureRandom = new SecureRandom();

    public AuthResponse register(RegisterRequest request) {
        require(request.firstName(), "First name is required");
        require(request.lastName(), "Last name is required");
        require(request.email(), "Email is required");
        require(request.password(), "Password is required");

        String email = normalizeEmail(request.email());
        if (request.password().length() < 8) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must be at least 8 characters");
        }
        if (userRepository.findByEmail(email).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists");
        }

        User user = new User();
        user.setFirstName(request.firstName().trim());
        user.setLastName(request.lastName().trim());
        user.setEmail(email);
        user.setCurrency(normalizeCurrency(request.currency()));
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setEmailVerified(false);
        String otp = prepareEmailOtp(user);

        User saved = userRepository.save(user);
        emailOtpService.sendOtp(saved.getEmail(), otp);
        return new AuthResponse(saved, jwtService.generateToken(saved), "Registration successful. Check your email for the verification code.");
    }

    public AuthResponse login(LoginRequest request) {
        require(request.email(), "Email is required");
        require(request.password(), "Password is required");

        User user = userRepository.findByEmail(normalizeEmail(request.email()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        if (Boolean.TRUE.equals(user.getEmailVerified())) {
            return new AuthResponse(user, jwtService.generateToken(user), "Login successful");
        }

        // Email not verified — send OTP and return user with a verification prompt
        String otp = prepareEmailOtp(user);
        userRepository.save(user);
        emailOtpService.sendOtp(user.getEmail(), otp);
        return new AuthResponse(user, null, "Email not verified. A verification code has been sent to your email.");
    }

    public User verifyEmail(Long userId, String code) {
        require(code, "OTP code is required");
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (Boolean.TRUE.equals(user.getEmailVerified())) {
            return user;
        }
        if (user.getEmailOtpHash() == null || user.getEmailOtpExpiresAt() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No verification code is active. Request a new code.");
        }
        if (LocalDateTime.now().isAfter(user.getEmailOtpExpiresAt())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Verification code has expired. Request a new code.");
        }
        if (!passwordEncoder.matches(code, user.getEmailOtpHash())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid verification code");
        }

        user.setEmailVerified(true);
        user.setEmailOtpHash(null);
        user.setEmailOtpExpiresAt(null);
        return userRepository.save(user);
    }

    public User resendEmailOtp(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (Boolean.TRUE.equals(user.getEmailVerified())) {
            return user;
        }

        String otp = prepareEmailOtp(user);
        User saved = userRepository.save(user);
        emailOtpService.sendOtp(saved.getEmail(), otp);
        return saved;
    }

    public User verifyEmailByEmail(String email, String code) {
        User user = userRepository.findByEmail(normalizeEmail(email))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return verifyEmail(user.getId(), code);
    }

    public User resendEmailOtpByEmail(String email) {
        User user = userRepository.findByEmail(normalizeEmail(email))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return resendEmailOtp(user.getId());
    }

    public User updateProfile(Long id, ProfileUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        require(request.firstName(), "First name is required");
        require(request.lastName(), "Last name is required");
        require(request.email(), "Email is required");

        String email = normalizeEmail(request.email());
        userRepository.findByEmail(email)
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists");
                });

        user.setFirstName(request.firstName().trim());
        user.setLastName(request.lastName().trim());
        user.setEmail(email);
        user.setCurrency(normalizeCurrency(request.currency()));

        if (request.newPassword() != null && !request.newPassword().isBlank()) {
            require(request.currentPassword(), "Current password is required to change your password");
            if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Current password is incorrect");
            }
            if (request.newPassword().length() < 8) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New password must be at least 8 characters");
            }
            user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        }

        return userRepository.save(user);
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }

    private String normalizeCurrency(String currency) {
        return currency == null || currency.isBlank() ? "USD" : currency.trim().toUpperCase();
    }

    private void require(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
        }
    }

    private String prepareEmailOtp(User user) {
        String otp = String.format("%06d", secureRandom.nextInt(1_000_000));
        user.setEmailOtpHash(passwordEncoder.encode(otp));
        user.setEmailOtpExpiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES));
        return otp;
    }
}
