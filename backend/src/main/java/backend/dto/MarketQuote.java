package backend.dto;

public record MarketQuote(
        String symbol,
        String name,
        Double price,
        Double changePercent,
        String currency,
        String source
) {
}
