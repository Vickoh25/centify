package backend.controller;

import backend.dto.MarketQuote;
import backend.service.MarketDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/market")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class MarketDataController {

    private final MarketDataService marketDataService;

    @GetMapping("/crypto")
    public Map<String, Object> getCryptoPrices() {
        return marketDataService.getCryptoPrices();
    }

    @GetMapping("/stock/{symbol}")
    public Map<String, Object> getStockPrice(@PathVariable String symbol) {
        return marketDataService.getStockPrice(symbol);
    }

    @GetMapping("/quote/{assetType}/{symbol}")
    public ResponseEntity<MarketQuote> getQuote(@PathVariable String assetType, @PathVariable String symbol) {
        return marketDataService.getQuote(symbol, assetType)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
