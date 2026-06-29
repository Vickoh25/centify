package backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "budgets")
public class Budget {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    @NotBlank(message = "Category is required")
    private String category;

    @Column(nullable = false)
    @NotNull(message = "Budget limit is required")
    @DecimalMin(value = "0.01", message = "Budget limit must be greater than 0")
    private Double limitAmount;

    @NotNull(message = "Spent amount is required")
    @DecimalMin(value = "0.0", message = "Spent amount cannot be negative")
    private Double spentAmount = 0.0;

    @NotBlank(message = "Month is required")
    @Pattern(regexp = "^\\d{4}-\\d{2}$", message = "Month must use YYYY-MM format")
    private String month; // e.g. "2026-05"

    private LocalDateTime createdAt = LocalDateTime.now();
}
