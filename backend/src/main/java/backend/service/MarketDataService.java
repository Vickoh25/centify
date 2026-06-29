package backend.service;

import backend.dto.MarketQuote;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;

@Service
public class MarketDataService {

    private final RestTemplate restTemplate = new RestTemplate();

    private static final String COINGECKO_URL = "https://api.coingecko.com/api/v3/simple/price?ids={ids}&vs_currencies=usd&include_24hr_change=true";

    private static final String YAHOO_QUOTE_URL = "https://query1.finance.yahoo.com/v7/finance/quote?symbols={symbol}";
    private static final String STOOQ_QUOTE_URL = "https://stooq.com/q/l/?s={symbol}&f=sd2t2c&h&e=csv";
    private static final Map<String, String> CRYPTO_IDS = Map.of(
            "BTC", "bitcoin",
            "ETH", "ethereum",
            "SOL", "solana",
            "BNB", "binancecoin",
            "ADA", "cardano",
            "DOGE", "dogecoin"
    );

    public Map<String, Object> getCryptoPrices() {
        try {
            String ids = "bitcoin,ethereum,solana,binancecoin,cardano,dogecoin";
            String url = COINGECKO_URL.replace("{ids}", ids);
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            return response.getBody();
        } catch (Exception e) {
            return new HashMap<>();
        }
    }

    public Map<String, Object> getStockPrice(String symbol) {
        return getQuote(symbol, "stock")
                .map(quote -> Map.<String, Object>of(
                        "symbol", quote.symbol(),
                        "name", quote.name(),
                        "price", quote.price(),
                        "changePercent", quote.changePercent(),
                        "currency", quote.currency(),
                        "source", quote.source()
                ))
                .orElseGet(HashMap::new);
    }

    public Optional<MarketQuote> getQuote(String symbol, String assetType) {
        if (symbol == null || symbol.isBlank()) {
            return Optional.empty();
        }

        String normalized = symbol.trim().toUpperCase();
        if ("crypto".equalsIgnoreCase(assetType)) {
            return getCryptoQuote(normalized);
        }

        return getYahooQuote(normalized).or(() -> getStooqQuote(normalized));
    }

    private Optional<MarketQuote> getCryptoQuote(String symbol) {
        String id = CRYPTO_IDS.get(symbol);
        if (id == null) {
            return Optional.empty();
        }

        try {
            String url = COINGECKO_URL.replace("{ids}", id);
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            Map body = response.getBody();
            if (body == null || !body.containsKey(id)) {
                return Optional.empty();
            }

            Map values = (Map) body.get(id);
            Double price = asDouble(values.get("usd"));
            Double change = asDouble(values.get("usd_24h_change"));
            if (price == null) {
                return Optional.empty();
            }
            return Optional.of(new MarketQuote(symbol, symbol, price, change, "USD", "CoinGecko"));
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    private Optional<MarketQuote> getYahooQuote(String symbol) {
        try {
            String url = YAHOO_QUOTE_URL.replace("{symbol}", symbol);
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            Map body = response.getBody();
            if (body == null) {
                return Optional.empty();
            }

            Map quoteResponse = (Map) body.get("quoteResponse");
            if (quoteResponse == null) {
                return Optional.empty();
            }

            java.util.List results = (java.util.List) quoteResponse.get("result");
            if (results == null || results.isEmpty()) {
                return Optional.empty();
            }

            Map result = (Map) results.get(0);
            Double price = asDouble(result.get("regularMarketPrice"));
            if (price == null) {
                return Optional.empty();
            }

            String name = stringValue(result.get("shortName"));
            Double change = asDouble(result.get("regularMarketChangePercent"));
            String currency = stringValue(result.get("currency"));
            return Optional.of(new MarketQuote(symbol, name == null ? symbol : name, price, change, currency == null ? "USD" : currency, "Yahoo Finance"));
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    private Optional<MarketQuote> getStooqQuote(String symbol) {
        try {
            String stooqSymbol = symbol.contains(".") ? symbol.toLowerCase() : symbol.toLowerCase() + ".us";
            String url = STOOQ_QUOTE_URL.replace("{symbol}", stooqSymbol);
            String csv = restTemplate.getForObject(url, String.class);
            if (csv == null || csv.isBlank()) {
                return Optional.empty();
            }

            String[] lines = csv.trim().split("\\R");
            if (lines.length < 2) {
                return Optional.empty();
            }

            String[] values = lines[1].split(",");
            if (values.length < 4 || "N/D".equalsIgnoreCase(values[3])) {
                return Optional.empty();
            }

            Double price = asDouble(values[3]);
            if (price == null) {
                return Optional.empty();
            }

            return Optional.of(new MarketQuote(symbol, symbol, price, null, "USD", "Stooq"));
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    private Double asDouble(Object value) {
        if (value instanceof Number number) {
            return number.doubleValue();
        }
        if (value instanceof String text && !text.isBlank()) {
            return Double.parseDouble(text);
        }
        return null;
    }

    private String stringValue(Object value) {
        return value == null ? null : value.toString();
    }
}
