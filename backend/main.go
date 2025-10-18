package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// --- Config ---
var jwtKey = []byte("my_secret_key") // Change this in production

// --- Models ---
type User struct {
	Username     string `json:"username"`
	PasswordHash string `json:"-"` // Dont send in JSON response
}

type Alert struct {
	ID          string  `json:"id"`
	UserID      string  `json:"userId"`
	Coin        string  `json:"coin"`
	TargetPrice float64 `json:"targetPrice"`
	DeviceToken string  `json:"deviceToken"`
}

// --- In-Memory DB (Replace with PostgreSQL) ---
var users = make(map[string]User)
var alerts = make(map[string][]Alert)

// --- Auth ---
type Claims struct {
	Username string `json:"username"`
	jwt.RegisteredClaims
}

func Register(c *gin.Context) {
	var creds struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	if err := c.BindJSON(&creds); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "bad request"})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(creds.Password), 8)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "server error"})
		return
	}

	users[creds.Username] = User{Username: creds.Username, PasswordHash: string(hashedPassword)}
	log.Println("New user registered:", creds.Username)
	c.JSON(http.StatusCreated, gin.H{"message": "user created"})
}

func Login(c *gin.Context) {
	var creds struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	if err := c.BindJSON(&creds); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "bad request"})
		return
	}

	user, ok := users[creds.Username]
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(creds.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
		return
	}

	expirationTime := time.Now().Add(24 * time.Hour)
	claims := &Claims{
		Username: creds.Username,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(jwtKey)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "server error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"token": tokenString})
}

// --- Auth Middleware ---
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString := c.GetHeader("Authorization")
		if tokenString == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "missing auth token"})
			c.Abort()
			return
		}
		// Expecting "Bearer <token>"
		tokenString = tokenString[7:]

		claims := &Claims{}
		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			return jwtKey, nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			c.Abort()
			return
		}

		c.Set("username", claims.Username)
		c.Next()
	}
}

// --- Alert Handlers ---
func CreateAlert(c *gin.Context) {
	username, _ := c.Get("username")
	var alert Alert
	if err := c.BindJSON(&alert); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "bad request"})
		return
	}

	alert.UserID = username.(string)
	alert.ID = "alert_" + time.Now().String() // Simple unique ID
	alerts[alert.UserID] = append(alerts[alert.UserID], alert)

	log.Println("New alert created for:", username)
	c.JSON(http.StatusCreated, alert)
}

func GetAlerts(c *gin.Context) {
	username, _ := c.Get("username")
	userAlerts, ok := alerts[username.(string)]
	if !ok {
		c.JSON(http.StatusOK, []Alert{})
		return
	}
	c.JSON(http.StatusOK, userAlerts)
}

// --- WebSocket Placeholder ---
func PriceDataIngestor() {
	// This is where you would connect to a real WebSocket feed
	// e.g., using "github.com/gorilla/websocket"
	log.Println("Starting price data ingestor... (placeholder)")
	
	// Simulate a price tick every 10 seconds
	ticker := time.NewTicker(10 * time.Second)
	for range ticker.C {
		// Mock price tick
		btcPrice := 68000.50 
		
		// This is where you would check against the 'alerts' map
		// and send push notifications via FCM
		log.Printf("Mock BTC price tick: $%.2f. Checking alerts...\n", btcPrice)
	}
}

// --- Main ---
func main() {
	// Start the background worker
	go PriceDataIngestor()

	// Start the API server
	r := gin.Default()

	auth := r.Group("/auth")
	{
		auth.POST("/register", Register)
		auth.POST("/login", Login)
	}

	api := r.Group("/api")
	api.Use(AuthMiddleware()) // Protect all /api routes
	{
		api.GET("/alerts", GetAlerts)
		api.POST("/alerts", CreateAlert)
	}

	log.Println("Starting server on :8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}