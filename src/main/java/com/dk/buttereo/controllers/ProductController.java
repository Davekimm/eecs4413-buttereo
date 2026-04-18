package com.dk.buttereo.controllers;

import com.dk.buttereo.models.Product;
import com.dk.buttereo.models.ProductDTO;
import com.dk.buttereo.services.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

/**
 * Controller class for managing product-related operations.
 */
@RestController
@CrossOrigin
@RequestMapping("/api/product")
public class ProductController {

    @Autowired
    private ProductService service;

    /**
     * Retrieves all products.
     *
     * @return ResponseEntity containing a list of ProductDTO objects or HTTP status code.
     */
    @GetMapping("/all")
    public ResponseEntity<List<ProductDTO>> getAllProducts()
    {
        return ResponseEntity.ok(service.getAllProducts());
    }

    /**
     * Retrieves a product by its ID.
     *
     * @param id The ID of the product to retrieve.
     * @return ResponseEntity containing the ProductDTO object or HTTP status code.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> getProduct(@PathVariable int id)
    {
        ProductDTO product = service.getProductById(id);

        return (product != null) ? ResponseEntity.ok(product) : ResponseEntity.status(HttpStatus.NOT_FOUND).build();

    }

    /**
     * Retrieves the image associated with a product by its ID.
     *
     * @param id The ID of the product for which to retrieve the image.
     * @return ResponseEntity containing the image data or HTTP status code.
     */
    @GetMapping("/{id}/image")
    public ResponseEntity<byte[]> getImageByProductId(@PathVariable String id) {
        int productId;
        try {
            productId = Integer.parseInt(id);
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().build();
        }

        ProductService.ProductImage image = service.getProductImage(productId);
        if (image == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(image.contentType()))
                .body(image.data());
    }

    /**
     * Searches for products based on a keyword.
     *
     * @param keyword The keyword to search for.
     * @return ResponseEntity containing a list of ProductDTO objects or HTTP status code.
     */
    @GetMapping("/search")
    public ResponseEntity<List<ProductDTO>> searchProducts(@RequestParam String keyword)
    {
        List<ProductDTO> products = service.searchProducts(keyword);
        if(products.isEmpty())
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();

        return ResponseEntity.ok(products);
    }

    /**
     * Filters products based on keyword, category, and sorting criteria.
     *
     * @param keyword The keyword to search for.
     * @param category The category to filter by.
     * @param sortName The sorting order for product names.
     * @param sortPrice The sorting order for product prices.
     * @return ResponseEntity containing a list of ProductDTO objects or HTTP status code.
     */
    @GetMapping("/filter")
    public ResponseEntity<List<ProductDTO>> filterProducts( @RequestParam(required = false) String keyword,
                                                         @RequestParam(required = false) String category,
                                                         @RequestParam(required = false) String sortName,
                                                         @RequestParam(required = false) String sortPrice
                                                         )
    {
        boolean nameAsc = "ascend".equalsIgnoreCase(sortName);
        boolean priceAsc = "ascend".equalsIgnoreCase(sortPrice);
        List<ProductDTO> products = service.filterProducts(keyword, category, nameAsc, priceAsc);

        return ResponseEntity.ok(products);
    }

    /**
     * Checks the availability of a product based on its ID and quantity.
     *
     * @param productId The ID of the product to check availability for.
     * @param quantity The quantity to check availability for.
     * @return ResponseEntity containing a list of ProductDTO objects or HTTP status code.
     */
    @GetMapping("/{productId}/check-availability")
    public ResponseEntity<String> checkProductAvailability(@PathVariable int productId, @RequestParam int quantity) {
        ProductDTO product = service.getProductById(productId);
        if (product == null) {
            return ResponseEntity.notFound().build();
        }

        if(product.getQuantity() < quantity) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Insufficient quantity available.");
        }

        return ResponseEntity.ok("Available: " + product.getQuantity());
    }

    /**
     * Adds a new product with an image file.
     *
     * @param product The product details to add.
     * @param imageFile The image file for the product.
     * @return ResponseEntity containing the newly added ProductDTO or HTTP status code.
     */
    @PostMapping("/add")
    public ResponseEntity<?> addProduct(@RequestPart Product product, @RequestPart MultipartFile imageFile) {
        if (imageFile == null || imageFile.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("A product image file is required.");
        }
        try {
            ProductDTO newProduct = service.addProduct(product, imageFile);
            return ResponseEntity.status(HttpStatus.CREATED).body(newProduct);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Updates an existing product with an optional image file.
     *
     * @param id The ID of the product to update.
     * @param product The updated product details.
     * @param imageFile The optional image file for the product.
     * @return ResponseEntity containing a success message or HTTP status code.
     */
    @PutMapping("/update/{id}")
    public ResponseEntity<String> updateProduct(@PathVariable int id,
                                                @RequestPart Product product,
                                                @RequestPart(required = false) MultipartFile imageFile)
    {
        try {
            ProductDTO updatedProduct = service.updateProduct(id, product, imageFile);
            if(updatedProduct != null)
                return ResponseEntity.ok("Product updated successfully");
            else
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Product not found");
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to process product image");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to update product");
        }
    }

    /**
     * Deletes a product by its ID.
     *
     * @param id The ID of the product to delete.
     * @return ResponseEntity containing a success message or HTTP status code.
     */
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteProduct(@PathVariable int id)
    {
        ProductDTO product = service.getProductById(id);
        if(product == null)
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Product not found");

        service.deleteProduct(id);
        return ResponseEntity.ok("Product deleted successfully");
    }
}
