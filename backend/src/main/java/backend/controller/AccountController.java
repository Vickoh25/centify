package backend.controller;

import backend.model.Account;
import backend.repository.AccountRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class AccountController {

    private final AccountRepository accountRepository;

    @GetMapping
    public List<Account> getAllAccounts(@AuthenticationPrincipal backend.model.User user) {
        return accountRepository.findByUserId(user.getId());
    }

    @GetMapping("/user/{userId}")
    public List<Account> getAccountsByUser(@PathVariable Long userId) {
        return accountRepository.findByUserId(userId);
    }

    @PostMapping
    public Account createAccount(@AuthenticationPrincipal backend.model.User user, @Valid @RequestBody Account account) {
        account.setUser(user);
        return accountRepository.save(account);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Account> updateAccount(@AuthenticationPrincipal backend.model.User user, @PathVariable Long id, @Valid @RequestBody Account updated) {
        return accountRepository.findById(id).filter(account -> account.getUser().getId().equals(user.getId())).map(account -> {
            account.setName(updated.getName());
            account.setType(updated.getType());
            account.setBankName(updated.getBankName());
            account.setAccountNumber(updated.getAccountNumber());
            account.setBalance(updated.getBalance());
            account.setCurrency(updated.getCurrency());
            account.setIsLinked(updated.getIsLinked());
            return ResponseEntity.ok(accountRepository.save(account));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAccount(@AuthenticationPrincipal backend.model.User user, @PathVariable Long id) {
        return accountRepository.findById(id).filter(account -> account.getUser().getId().equals(user.getId())).map(account -> {
            accountRepository.delete(account);
            return ResponseEntity.noContent().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
