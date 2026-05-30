package com.roomrental;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class RoomRentalApplication {
    public static void main(String[] args) {
        SpringApplication.run(RoomRentalApplication.class, args);
    }
}
