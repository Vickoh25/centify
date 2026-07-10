package backend.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false, unique = true)
    private String email;

    @JsonIgnore
    @Column
    private String passwordHash;

    private String currency = "USD";

    private Boolean emailVerified = true;

    @JsonIgnore
    private String emailOtpHash;

    @JsonIgnore
    private LocalDateTime emailOtpExpiresAt;

    private Boolean twoFactorEnabled = false;

    @JsonIgnore
    private String twoFactorOtpHash;

    @JsonIgnore
    private LocalDateTime twoFactorOtpExpiresAt;

    private LocalDateTime createdAt = LocalDateTime.now();
}
