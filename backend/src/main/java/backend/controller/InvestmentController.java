package backend.controller;

import backend.dto.MarketQuote;
import backend.model.Investment;
import backend.repository.InvestmentRepository;
import backend.service.MarketDataService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/investments")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class InvestmentController {

    private final InvestmentRepository investmentRepository;
    private final MarketDataService marketDataService;

    @GetMapping
    public List<Investment> getAllInvestments(@AuthenticationPrincipal backend.model.User user) {
        return investmentRepository.findByUserId(user.getId());
    }

    @GetMapping("/user/{userId}")
    public List<Investment> getInvestmentsByUser(@PathVariable Long userId) {
        return investmentRepository.findByUserId(userId);
    }

    @GetMapping("/user/{userId}/type/{assetType}")
    public List<Investment> getByAssetType(@PathVariable Long userId, @PathVariable String assetType) {
        return investmentRepository.findByUserIdAndAssetType(userId, assetType);
    }

    @PostMapping
    public Investment createInvestment(@AuthenticationPrincipal backend.model.User user, @Valid @RequestBody Investment investment) {
        if (!Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN, "Email verification is required to add an investment");
        }
        investment.setUser(user);
        marketDataService.getQuote(investment.getSymbol(), investment.getAssetType())
                .ifPresent(quote -> {
                    investment.setCurrentPrice(quote.price());
                    if (investment.getName() == null || investment.getName().isBlank()) {
                        investment.setName(quote.name());
                    }
                });
        return investmentRepository.save(investment);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Investment> updateInvestment(@AuthenticationPrincipal backend.model.User user, @PathVariable Long id, @Valid @RequestBody Investment updated) {
        return investmentRepository.findById(id).filter(investment -> investment.getUser().getId().equals(user.getId())).map(investment -> {
            investment.setSymbol(updated.getSymbol());
            investment.setName(updated.getName());
            investment.setAssetType(updated.getAssetType());
            investment.setQuantity(updated.getQuantity());
            investment.setBuyPrice(updated.getBuyPrice());
            investment.setCurrentPrice(updated.getCurrentPrice());
            return ResponseEntity.ok(investmentRepository.save(investment));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/refresh-price")
    public ResponseEntity<Investment> refreshInvestmentPrice(@AuthenticationPrincipal backend.model.User user, @PathVariable Long id) {
        return investmentRepository.findById(id)
                .filter(investment -> investment.getUser().getId().equals(user.getId()))
                .flatMap(investment -> marketDataService.getQuote(investment.getSymbol(), investment.getAssetType())
                        .map(quote -> applyQuote(investment, quote)))
                .map(investmentRepository::save)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/refresh-prices")
    public List<Investment> refreshInvestmentPrices(@AuthenticationPrincipal backend.model.User user) {
        List<Investment> investments = investmentRepository.findByUserId(user.getId());
        investments.forEach(investment ->
                marketDataService.getQuote(investment.getSymbol(), investment.getAssetType())
                        .ifPresent(quote -> applyQuote(investment, quote))
        );
        return investmentRepository.saveAll(investments);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInvestment(@AuthenticationPrincipal backend.model.User user, @PathVariable Long id) {
        return investmentRepository.findById(id).filter(investment -> investment.getUser().getId().equals(user.getId())).map(investment -> {
            investmentRepository.delete(investment);
            return ResponseEntity.noContent().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }

    private Investment applyQuote(Investment investment, MarketQuote quote) {
        investment.setCurrentPrice(quote.price());
        if (investment.getName() == null || investment.getName().isBlank() || investment.getName().equalsIgnoreCase(investment.getSymbol())) {
            investment.setName(quote.name());
        }
        return investment;
    }
}
