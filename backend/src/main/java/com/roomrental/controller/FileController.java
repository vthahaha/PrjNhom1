package com.roomrental.controller;

import com.roomrental.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.InputStream;

@RestController
@RequestMapping("/api/public/files")
@RequiredArgsConstructor
public class FileController {

    private final FileStorageService fileStorageService;

    @GetMapping("/{filename}")
    public ResponseEntity<InputStreamResource> getFile(@PathVariable String filename) {
        InputStream stream = fileStorageService.getFileStream(filename);
        String extension = filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();

        MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
        if (extension.equals("pdf")) mediaType = MediaType.APPLICATION_PDF;
        else if (extension.equals("png")) mediaType = MediaType.IMAGE_PNG;
        else if (extension.equals("jpg") || extension.equals("jpeg")) mediaType = MediaType.IMAGE_JPEG;

        // Cho phép hiển thị trên trình duyệt (inline) thay vì tải xuống
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .contentType(mediaType)
                .body(new InputStreamResource(stream));
    }
}
