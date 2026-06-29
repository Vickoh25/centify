package backend.controller;

import backend.dto.AuthResponse;
import backend.dto.LoginRequest;
import backend.dto.ProfileUpdateRequest;
import backend.dto.RegisterRequest;
import backend.dto.VerifyEmailRequest;
import backend.model.User;
import backend.repository.UserRepository;
import backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class UserController {

    private final UserRepository userRepository;
    private final UserService userService;

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return userService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return userService.login(request);
    }

    @PostMapping("/verify-email")
    public User verifyEmail(@AuthenticationPrincipal User user, @Valid @RequestBody VerifyEmailRequest request) {
        return userService.verifyEmail(user.getId(), request.code());
    }

    @PostMapping("/resend-otp")
    public User resendOtp(@AuthenticationPrincipal User user) {
        return userService.resendEmailOtp(user.getId());
    }

    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<User> createUser() {
        return ResponseEntity.badRequest().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User updated) {
        ProfileUpdateRequest request = new ProfileUpdateRequest(
                updated.getFirstName(),
                updated.getLastName(),
                updated.getEmail(),
                updated.getCurrency(),
                null,
                null
        );
        return ResponseEntity.ok(userService.updateProfile(id, request));
    }

    @PutMapping("/{id}/profile")
    public User updateProfile(@PathVariable Long id, @Valid @RequestBody ProfileUpdateRequest request) {
        return userService.updateProfile(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
