package backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "accounts")
public class Account {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    @NotBlank(message = "Account name is required")
    @Size(max = 120, message = "Account name must be 120 characters or less")
    private String name;

    @Column(nullable = false)
    @NotBlank(message = "Account type is required")
    @Pattern(regexp = "checking|savings|credit|investment", message = "Choose a valid account type")
    private String type; // checking, savings, credit, investment

    @Size(max = 120, message = "Bank name must be 120 characters or less")
    private String bankName;

    @Size(max = 40, message = "Account number must be 40 characters or less")
    private String accountNumber;

    @NotNull(message = "Balance is required")
    private Double balance = 0.0;

    @Pattern(regexp = "^[A-Za-z]{3}$", message = "Currency must be a 3-letter code")
    private String currency = "USD";

    private Boolean isLinked = false;

    private LocalDateTime createdAt = LocalDateTime.now();
}
