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
@Table(name = "investments")
public class Investment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    @NotBlank(message = "Symbol is required")
    @Size(max = 20, message = "Symbol must be 20 characters or less")
    private String symbol; // e.g. AAPL, BTC

    @Column(nullable = false)
    @NotBlank(message = "Name is required")
    @Size(max = 120, message = "Name must be 120 characters or less")
    private String name; // e.g. Apple Inc.

    @Column(nullable = false)
    @NotBlank(message = "Asset type is required")
    @Pattern(regexp = "stock|crypto|bond|share", message = "Choose a valid asset type")
    private String assetType; // stock, crypto, bond, share

    @NotNull(message = "Quantity is required")
    @DecimalMin(value = "0.000001", message = "Quantity must be greater than 0")
    private Double quantity;

    @NotNull(message = "Buy price is required")
    @DecimalMin(value = "0.0", message = "Buy price cannot be negative")
    private Double buyPrice;

    @NotNull(message = "Current price is required")
    @DecimalMin(value = "0.0", message = "Current price cannot be negative")
    private Double currentPrice;

    private LocalDateTime purchaseDate = LocalDateTime.now();
}
