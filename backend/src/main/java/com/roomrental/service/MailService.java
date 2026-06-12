package com.roomrental.service;

public interface MailService {
    void sendHtmlMessage(String to, String subject, String htmlBody);
}
