package com.roomrental.service;

import com.roomrental.exception.BadRequestException;
import io.minio.GetPresignedObjectUrlArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.http.Method;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class FileStorageService {

    private final MinioClient minioClient;

    @Value("${app.minio.bucket-name}")
    private String bucketName;

    @Value("${app.minio.url}")
    private String minioUrl;

    @Value("${app.minio.external-url}")
    private String minioExternalUrl;

    private static final List<String> ALLOWED_EXTENSIONS = List.of("pdf", "docx", "png", "jpg", "jpeg");

    public String uploadFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("File tải lên không được để trống");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.contains(".")) {
            throw new BadRequestException("Tên file không hợp lệ");
        }

        String extension = originalFilename.substring(originalFilename.lastIndexOf(".") + 1).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new BadRequestException("Chỉ cho phép tải lên file định dạng: " + ALLOWED_EXTENSIONS);
        }

        String filename = UUID.randomUUID() + "-" + originalFilename.replaceAll("\\s+", "_");

        try {
            boolean found = minioClient.bucketExists(io.minio.BucketExistsArgs.builder().bucket(bucketName).build());
            if (!found) {
                minioClient.makeBucket(io.minio.MakeBucketArgs.builder().bucket(bucketName).build());
            }

            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(filename)
                            .stream(file.getInputStream(), file.getSize(), -1)
                            .contentType(file.getContentType())
                            .build()
            );
            return filename;
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi tải file lên MinIO: " + e.getMessage());
        }
    }

    @Value("${app.backend-url:http://localhost:8080}")
    private String backendUrl;

    public String getPresignedUrl(String filename) {
        if (filename == null || filename.isBlank()) {
            return null;
        }
        return backendUrl + "/api/public/files/" + filename;
    }

    public java.io.InputStream getFileStream(String filename) {
        try {
            return minioClient.getObject(
                    io.minio.GetObjectArgs.builder()
                            .bucket(bucketName)
                            .object(filename)
                            .build()
            );
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi tải file: " + e.getMessage());
        }
    }

    public void deleteFile(String filename) {
        if (filename == null || filename.isBlank()) {
            return;
        }
        try {
            minioClient.removeObject(
                    io.minio.RemoveObjectArgs.builder()
                            .bucket(bucketName)
                            .object(filename)
                            .build()
            );
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi xóa file trên MinIO: " + e.getMessage());
        }
    }
}
