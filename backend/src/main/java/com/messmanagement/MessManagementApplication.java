package com.messmanagement;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class MessManagementApplication {
    public static void main(String[] args) {
        SpringApplication.run(MessManagementApplication.class, args);
    }
}
