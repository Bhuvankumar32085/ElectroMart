#  ElectroMart — AI Powered E-Commerce Platform

ElectroMart is a **full-stack, AI-integrated e-commerce platform** built with modern web technologies and real-time systems.
It supports multiple roles (**User, Vendor, Admin**) and introduces an **Agentic AI Chatbot** powered by LLM + Tool-based architecture.

---

## 🌐 Live Links

*  Frontend (Next.js):
  https://electro-mart-u5yl.vercel.app

*  AI Backend (Flask + LLM):
  https://electromart-ai-backend.onrender.com

*  Socket Server (Real-time):
  https://electromary-socket-server.onrender.com

---

##  Project Overview

ElectroMart is not just an e-commerce app — it's an **intelligent shopping ecosystem**.

Users can:

* Browse & search products
* Place and track orders in real-time
* Interact with an **AI assistant** for smart shopping

Vendors can:

* Manage products and orders
* Receive real-time notifications

Admins can:

* Control vendor verification
* Monitor platform activity

---

#  AI Chatbot (Agentic AI System)

A dedicated **Flask-based AI microservice** powers the chatbot.

###  Key Features:

* Tool-based reasoning (LangChain)
* Context-aware responses
* Multi-tool execution:

  * 🛍️ Product Search
  * 📦 Order Tracking
  * 👤 User Insights

---

##  AI Architecture

```
User Query
   ↓
LLM (Gemini)
   ↓
Decision Layer (Agent)
   ↓
Tools Execution
   ↓
Next.js APIs
   ↓
MongoDB
   ↓
Final AI Response
```

---

##  AI Tools Implemented

* `search_products` → semantic product search
* `get_user_orders` → order tracking
* `get_user_details` → personalized insights

---

#  Data Science Integration

This project also reflects **Data Science concepts in production**:

###  Applied Concepts:

* Data cleaning & response optimization
* Feature extraction (orders, cart behavior)
* Context-aware recommendation base
* Structured response formatting for LLM

###  Future Scope:

* Recommendation Engine (Collaborative Filtering)
* User Behavior Analysis
* Sales Prediction (Time Series)
* Product Ranking (ML Models)

---

# ⚙️ Tech Stack

##  Frontend

* Next.js (App Router)
* React
* Tailwind CSS
* Redux Toolkit

##  Backend (Core)

* Next.js API Routes
* MongoDB + Mongoose
* NextAuth (JWT Authentication)

##  AI Backend

* Flask
* LangChain
* Google Gemini API
* Tool-based Agent Architecture

##  Real-Time System

* Node.js
* Express.js
* Socket.IO

---

#  Architecture

```
Frontend (Vercel)
   ↓
Flask AI Server (Render)
   ↓
Next.js API (Vercel)
   ↓
MongoDB Atlas
   ↓
Socket Server (Render)
```

---

#  Real-Time Features

* Live product updates
* Order status tracking
* Vendor notifications
* Order cancellation & returns
* Real-time chat system
* Multi-tab sync

---

#  Security & Performance

* JWT-based authentication
* Secure API communication
* CORS protection
* Optimized API responses for AI
* Scalable microservice architecture

---

#  Key Highlights

*  Agentic AI (not simple chatbot)
*  Real-time scalable system
*  AI + Data Science integration
*  Microservices architecture
*  Production-ready deployment

---

#  Future Enhancements

* AI Recommendation Engine
* Voice-based assistant
* Vector DB (semantic search)
* LangGraph integration
* AI-powered analytics dashboard

---

#  Developer

Built with  by **Bhuvan**

---

#  If you like this project

Give it a ⭐ on GitHub and support the journey 
