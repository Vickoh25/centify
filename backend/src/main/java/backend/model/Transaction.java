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
@Table(name = "transactions")
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "account_id")
    private Account account;

    @Column(nullable = false)
    @NotBlank(message = "Description is required")
    @Size(max = 160, message = "Description must be 160 characters or less")
    private String description;

    @Column(nullable = false)
    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private Double amount;

    @Column(nullable = false)
    @NotBlank(message = "Transaction type is required")
    @Pattern(regexp = "income|expense", message = "Transaction type must be income or expense")
    private String type; // income or expense

    @NotBlank(message = "Category is required")
    private String category; // food, transport, housing, etc.

    @Size(max = 60, message = "Tag must be 60 characters or less")
    private String tag;

    @NotNull(message = "Date is required")
    private LocalDateTime date = LocalDateTime.now();
}
