package com.accesoriosdm.api_gateway;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class FallbackController {

    @GetMapping("/fallback/inventory")
    public String inventoryFallback() {
        return "Servicio de inventario no disponible. Intente más tarde.";
    }

    @GetMapping("/fallback/products")
    public String productFallback() {
        return "Servicio de productos no disponible. Intente más tarde.";
    }

    // NUEVO: Fallback para el servicio de pagos
    @GetMapping("/fallback/payment")
    public String paymentFallback() {
        return "Servicio de pagos no disponible. Intente más tarde.";
    }
}