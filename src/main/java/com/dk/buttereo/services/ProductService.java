package com.dk.buttereo.services;

import com.dk.buttereo.models.Product;
import com.dk.buttereo.models.ProductDTO;
import com.dk.buttereo.repositories.ProductRepo;
import com.dk.buttereo.repositories.ProductSpecifications;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

/**
 * Service class for managing product-related operations.
 */
@Service
public class ProductService {

    // Product image container
    public record ProductImage(byte[] data, String contentType) {}

    @Autowired
    private ProductRepo productRepo;

    /**
     * Get all products
     *
     * @return List of product DTOs
     */
    public List<ProductDTO> getAllProducts() {
        List<Product> orders = productRepo.findAll();
        return orders.stream().map(ProductDTO::fromProduct).toList();
    }

    /**
     * Get product by id
     *
     * @param id product id
     * @return product DTO
     */
    public ProductDTO getProductById(int id) {
        Product product = productRepo.findById(id).orElse(null);
        if(product == null)
            return null;

        return ProductDTO.fromProduct(product);
    }

    /**
     * Get product image by id
     *
     * @param id product id
     * @return product image
     */
    @Transactional
    public ProductImage getProductImage(int id) {
        Product product = productRepo.findById(id).orElse(null);
        if (product == null) {
            return null;
        }

        byte[] data = product.getImageData();
        if (data == null || data.length == 0) {
            return null;
        }

        String contentType = product.getImageType();
        if (contentType == null || contentType.isBlank()) {
            contentType = "image/jpeg";
        }
        return new ProductImage(data, contentType);
    }

    /**
     * Search products by keyword
     *
     * @param keyword search keyword
     * @return list of product DTOs
     */
    public List<ProductDTO> searchProducts(String keyword) {
        List<Product> products = productRepo.searchProducts(keyword);
        return products.stream().map(ProductDTO::fromProduct).toList();
    }

    /**
     * Filter products by keyword, category, and sorting
     *
     * @param keyword search keyword
     * @param category product category
     * @param sortNameAsc sort by name ascending
     * @param sortPriceAsc sort by price ascending
     * @return list of product DTOs
     */
    public List<ProductDTO> filterProducts(String keyword, String category, boolean sortNameAsc, boolean sortPriceAsc) {
        Specification<Product> spec = (_, _, cb) -> cb.conjunction();

        if (category != null && !category.isBlank()) {
            spec = spec.and(ProductSpecifications.hasCategory(category.trim()));
        }

        if (keyword != null && !keyword.isBlank()) {
            spec = spec.and(ProductSpecifications.matchKeyword(keyword));
        }

        Sort sort;
        if (sortNameAsc) {
            sort = Sort.by(Sort.Order.asc("name"));
        } else if (sortPriceAsc) {
            sort = Sort.by(Sort.Order.asc("price"));
        } else {
            sort = Sort.unsorted();
        }

        List<Product> products = productRepo.findAll(spec, sort);

        return products.stream().map(ProductDTO::fromProduct).toList();
    }

    /**
     * Add a new product
     *
     * @param product product
     * @param imageFile product image
     * @return product DTO
     */
    @Transactional
    public ProductDTO addProduct(Product product, MultipartFile imageFile) throws IOException {
        if (imageFile == null || imageFile.isEmpty()) {
            throw new IllegalArgumentException("A product image file is required.");
        }
        product.setId(null);
        if (product.getQuantity() == null) {
            product.setQuantity(0);
        }
        if (product.getPrice() == null) {
            product.setPrice(0f);
        }
        product.setImageName(imageFile.getOriginalFilename());
        product.setImageType(imageFile.getContentType());
        product.setImageData(imageFile.getBytes());

        Product savedProduct = productRepo.save(product);

        return ProductDTO.fromProduct(savedProduct);
    }

    /**
     * Update product
     *
     * @param id product id
     * @param product product
     * @param imageFile product image
     * @return product DTO
     */
    @Transactional
    public ProductDTO updateProduct(int id, Product product, MultipartFile imageFile) throws IOException {
        Product existing = productRepo.findById(id).orElse(null);
        if (existing == null) {
            throw new IllegalArgumentException("Product with ID " + id + " not found.");
        }

        existing.setName(product.getName());
        existing.setDescription(product.getDescription());
        existing.setBrand(product.getBrand());
        existing.setCategory(product.getCategory());
        existing.setAvailable(product.isAvailable());

        if (product.getPrice() == null) {
            existing.setPrice(0f);
        } else {
            existing.setPrice(product.getPrice());
        }

        if (product.getQuantity() == null) {
            existing.setQuantity(0);
        } else {
            existing.setQuantity(product.getQuantity());
        }

        if (imageFile != null && !imageFile.isEmpty()) {
            existing.setImageData(imageFile.getBytes());
            existing.setImageName(imageFile.getOriginalFilename());
            existing.setImageType(imageFile.getContentType());
        }

        Product updatedProduct = productRepo.save(existing);

        return ProductDTO.fromProduct(updatedProduct);
    }

    /**
     * Delete product
     *
     * @param id product id
     */
    @Transactional
    public void deleteProduct(int id) {
        productRepo.deleteById(id);
    }
}
