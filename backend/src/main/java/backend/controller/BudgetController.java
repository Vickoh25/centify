package backend.controller;

import backend.model.Budget;
import backend.repository.BudgetRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class BudgetController {

    private final BudgetRepository budgetRepository;

    @GetMapping
    public List<Budget> getAllBudgets(@AuthenticationPrincipal backend.model.User user) {
        return budgetRepository.findByUserId(user.getId());
    }

    @GetMapping("/user/{userId}")
    public List<Budget> getBudgetsByUser(@PathVariable Long userId) {
        return budgetRepository.findByUserId(userId);
    }

    @GetMapping("/user/{userId}/month/{month}")
    public List<Budget> getBudgetsByMonth(@PathVariable Long userId, @PathVariable String month) {
        return budgetRepository.findByUserIdAndMonth(userId, month);
    }

    @PostMapping
    public Budget createBudget(@AuthenticationPrincipal backend.model.User user, @Valid @RequestBody Budget budget) {
        budget.setUser(user);
        return budgetRepository.save(budget);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Budget> updateBudget(@AuthenticationPrincipal backend.model.User user, @PathVariable Long id, @Valid @RequestBody Budget updated) {
        return budgetRepository.findById(id).filter(budget -> budget.getUser().getId().equals(user.getId())).map(budget -> {
            budget.setCategory(updated.getCategory());
            budget.setLimitAmount(updated.getLimitAmount());
            budget.setSpentAmount(updated.getSpentAmount());
            budget.setMonth(updated.getMonth());
            return ResponseEntity.ok(budgetRepository.save(budget));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBudget(@AuthenticationPrincipal backend.model.User user, @PathVariable Long id) {
        return budgetRepository.findById(id).filter(budget -> budget.getUser().getId().equals(user.getId())).map(budget -> {
            budgetRepository.delete(budget);
            return ResponseEntity.noContent().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
