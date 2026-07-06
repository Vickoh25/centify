package backend.controller;

import backend.model.Transaction;
import backend.repository.TransactionRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class TransactionController {

    private final TransactionRepository transactionRepository;

    @GetMapping
    public List<Transaction> getAllTransactions(@AuthenticationPrincipal backend.model.User user) {
        return transactionRepository.findByUserId(user.getId());
    }

    @GetMapping("/user/{userId}")
    public List<Transaction> getTransactionsByUser(@PathVariable Long userId) {
        return transactionRepository.findByUserId(userId);
    }

    @GetMapping("/user/{userId}/type/{type}")
    public List<Transaction> getByType(@PathVariable Long userId, @PathVariable String type) {
        return transactionRepository.findByUserIdAndType(userId, type);
    }

    @GetMapping("/user/{userId}/category/{category}")
    public List<Transaction> getByCategory(@PathVariable Long userId, @PathVariable String category) {
        return transactionRepository.findByUserIdAndCategory(userId, category);
    }

    @PostMapping
    public Transaction createTransaction(@AuthenticationPrincipal backend.model.User user, @Valid @RequestBody Transaction transaction) {
        if (!Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN, "Email verification is required to add a transaction");
        }
        transaction.setUser(user);
        return transactionRepository.save(transaction);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Transaction> updateTransaction(@AuthenticationPrincipal backend.model.User user, @PathVariable Long id, @Valid @RequestBody Transaction updated) {
        return transactionRepository.findById(id).filter(transaction -> transaction.getUser().getId().equals(user.getId())).map(transaction -> {
            transaction.setDescription(updated.getDescription());
            transaction.setAmount(updated.getAmount());
            transaction.setType(updated.getType());
            transaction.setCategory(updated.getCategory());
            transaction.setTag(updated.getTag());
            transaction.setDate(updated.getDate());
            return ResponseEntity.ok(transactionRepository.save(transaction));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(@AuthenticationPrincipal backend.model.User user, @PathVariable Long id) {
        return transactionRepository.findById(id).filter(transaction -> transaction.getUser().getId().equals(user.getId())).map(transaction -> {
            transactionRepository.delete(transaction);
            return ResponseEntity.noContent().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
