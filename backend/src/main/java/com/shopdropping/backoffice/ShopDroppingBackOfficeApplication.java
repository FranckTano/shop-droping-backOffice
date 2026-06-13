package com.shopdropping.backoffice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ShopDroppingBackOfficeApplication {

    public static void main(String[] args) {
        SpringApplication.run(ShopDroppingBackOfficeApplication.class, args);
    }
}
