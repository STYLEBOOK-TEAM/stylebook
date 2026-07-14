package com.stylebook;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class StyleBookApplication {
    public static void main(String[] args) {
        SpringApplication.run(StyleBookApplication.class, args);
    }
}