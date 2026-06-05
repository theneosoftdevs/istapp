# Architecture Backend - Microservices Golang
## ISTA PORTAL - Plateforme de Gestion Universitaire

---

## 📋 Vue d'ensemble

Cette architecture remplace le store in-memory React par une infrastructure backend scalable basée sur des microservices Golang. Chaque service est responsable d'un domaine métier spécifique (Domain-Driven Design).

**Stack technologique:**
- **Language:** Go 1.21+
- **Architecture:** Microservices avec gRPC & REST API
- **Base de données:** PostgreSQL (principal) + Redis (cache)
- **Message Queue:** RabbitMQ ou Kafka
- **API Gateway:** Kong ou Traefik
- **Container:** Docker + Docker Compose
- **Orchestration:** Kubernetes (production)

---

## 🏗️ Services Microservices

### 1. **Auth Service** (`auth-service`)
**Responsabilité:** Authentification, autorisation, gestion des rôles RBAC

#### Endpoints:
```
POST   /auth/login              # Login avec rôle
POST   /auth/register           # Création de compte
POST   /auth/refresh-token      # Rafraîchir le token JWT
POST   /auth/logout             # Logout
POST   /auth/verify-token       # Vérifier la validité du token
GET    /auth/user/:id           # Récupérer les infos utilisateur
PUT    /auth/user/:id           # Modifier profil utilisateur
```

#### Rôles gérés:
- `student`
- `teacher`
- `apparitorat`
- `secretariat_faculte`
- `secretariat_general`
- `rectorat`

#### Technologies:
- JWT pour les tokens
- bcrypt pour le hashing des mots de passe
- Redis pour la blacklist des tokens

---

### 2. **Student Service** (`student-service`)
**Responsabilité:** Gestion des étudiants, inscriptions, suivi académique

#### Endpoints:
```
GET    /students                # Lister tous les étudiants (avec filters)
GET    /students/:id            # Détails étudiant
POST   /students                # Créer nouvel étudiant
PUT    /students/:id            # Modifier étudiant
DELETE /students/:id            # Supprimer étudiant
GET    /students/:id/schedule   # Planning étudiant
GET    /students/:id/grades     # Notes étudiants
GET    /students/:id/courses    # Cours suivis
POST   /students/:id/appeal     # Soumettre recours sur note
GET    /students/faculty/:fid   # Étudiants par faculté
GET    /students/promotion/:pid # Étudiants par promotion
```

#### Modèle de données:
```go
type Student struct {
    ID           string    `json:"id"`
    FirstName    string    `json:"firstName"`
    MiddleName   string    `json:"middleName"`
    LastName     string    `json:"lastName"`
    Email        string    `json:"email"`
    BirthDate    time.Time `json:"birthDate"`
    Gender       string    `json:"gender"` // "M" | "F"
    Status       string    `json:"status"` // "active", "pending", "graduated"
    FacultyID    string    `json:"facultyId"`
    PromotionID  string    `json:"promotionId"`
    Matricule    string    `json:"matricule"`
    PhoneNumber  string    `json:"phoneNumber"`
    Address      string    `json:"address"`
    CreatedAt    time.Time `json:"createdAt"`
    UpdatedAt    time.Time `json:"updatedAt"`
}
```

---

### 3. **Teacher Service** (`teacher-service`)
**Responsabilité:** Gestion des enseignants, attribution de cours, encoding des notes

#### Endpoints:
```
GET    /teachers                # Lister tous les enseignants
GET    /teachers/:id            # Détails enseignant
POST   /teachers                # Créer nouvel enseignant
PUT    /teachers/:id            # Modifier enseignant
DELETE /teachers/:id            # Supprimer enseignant
GET    /teachers/:id/courses    # Cours attribués
GET    /teachers/:id/schedule   # Planning enseignant
POST   /teachers/:id/assign-course  # Attribuer cours
PUT    /teachers/:id/grades/:gid    # Encoder note
GET    /teachers/:id/dashboard  # Dashboard enseignant
```

#### Modèle de données:
```go
type Teacher struct {
    ID          string    `json:"id"`
    FirstName   string    `json:"firstName"`
    MiddleName  string    `json:"middleName"`
    LastName    string    `json:"lastName"`
    Email       string    `json:"email"`
    Matricule   string    `json:"matricule"`
    Title       string    `json:"title"` // "Professeur", "Assistant", etc.
    FacultyID   string    `json:"facultyId"`
    CourseIDs   []string  `json:"courseIds"`
    Department  string    `json:"department"`
    PhoneNumber string    `json:"phoneNumber"`
    CreatedAt   time.Time `json:"createdAt"`
    UpdatedAt   time.Time `json:"updatedAt"`
}
```

---

### 4. **Academic Service** (`academic-service`)
**Responsabilité:** Gestion des cours, promotions, facultés, plannings

#### Endpoints:
```
# Courses
GET    /courses                 # Lister tous les cours
GET    /courses/:id             # Détails cours
POST   /courses                 # Créer cours
PUT    /courses/:id             # Modifier cours
DELETE /courses/:id             # Supprimer cours

# Faculties
GET    /faculties               # Lister facultés
GET    /faculties/:id           # Détails faculté
POST   /faculties               # Créer faculté
PUT    /faculties/:id           # Modifier faculté

# Promotions
GET    /promotions              # Lister promotions
GET    /promotions/:id          # Détails promotion
POST   /promotions              # Créer promotion
PUT    /promotions/:id          # Modifier promotion

# Schedules
GET    /schedules               # Lister plannings
POST   /schedules               # Créer planning
PUT    /schedules/:id           # Modifier planning
DELETE /schedules/:id           # Supprimer planning
GET    /schedules/conflict-check # Vérifier conflits
```

#### Modèles de données:
```go
type Course struct {
    ID          string    `json:"id"`
    Name        string    `json:"name"`
    Code        string    `json:"code"`
    Description string    `json:"description"`
    Credits     int       `json:"credits"`
    Hours       int       `json:"hours"`
    TeacherID   string    `json:"teacherId"`
    PromotionID string    `json:"promotionId"`
    FacultyID   string    `json:"facultyId"`
    RoomID      string    `json:"roomId"`
    Status      string    `json:"status"` // "active", "archived"
    CreatedAt   time.Time `json:"createdAt"`
    UpdatedAt   time.Time `json:"updatedAt"`
}

type ScheduleSlot struct {
    ID        string    `json:"id"`
    CourseID  string    `json:"courseId"`
    TeacherID string    `json:"teacherId"`
    RoomID    string    `json:"roomId"`
    Day       string    `json:"day"` // "Lundi", "Mardi", ...
    Start     string    `json:"start"` // "08:00"
    End       string    `json:"end"`   // "10:00"
    StartDate string    `json:"startDate"`
    EndDate   string    `json:"endDate"`
    CreatedAt time.Time `json:"createdAt"`
}

type Faculty struct {
    ID          string    `json:"id"`
    Name        string    `json:"name"`
    Code        string    `json:"code"`
    Dean        string    `json:"dean"`
    Description string    `json:"description"`
    CreatedAt   time.Time `json:"createdAt"`
    UpdatedAt   time.Time `json:"updatedAt"`
}

type Promotion struct {
    ID        string    `json:"id"`
    Name      string    `json:"name"`
    Year      int       `json:"year"`
    FacultyID string    `json:"facultyId"`
    CreatedAt time.Time `json:"createdAt"`
}
```

---

### 5. **Grade Service** (`grade-service`)
**Responsabilité:** Gestion des notes, appels et recours

#### Endpoints:
```
GET    /grades                  # Lister toutes les notes
GET    /grades/:id              # Détails note
POST   /grades                  # Créer note
PUT    /grades/:id              # Modifier note
PATCH  /grades/:id/status       # Changer statut (pending, validated)
GET    /grades/student/:sid     # Notes étudiant
GET    /grades/course/:cid      # Notes du cours
GET    /grades/statistics       # Stats globales

# Appeals (Recours)
GET    /appeals                 # Lister tous les recours
GET    /appeals/:id             # Détails recours
POST   /appeals                 # Créer recours
PUT    /appeals/:id             # Répondre à recours
PATCH  /appeals/:id/resolve     # Approuver/Rejeter recours
```

#### Modèles de données:
```go
type Grade struct {
    ID              string    `json:"id"`
    StudentID       string    `json:"studentId"`
    CourseID        string    `json:"courseId"`
    PromotionID     string    `json:"promotionId"`
    Score           float64   `json:"score"` // 0-20
    Type            string    `json:"type"` // "Examen", "TP", "Interro"
    Session         string    `json:"session"` // "Travail pratique", etc.
    AssessmentTitle string    `json:"assessmentTitle"`
    Status          string    `json:"status"` // "pending", "validated"
    Title           string    `json:"title"`
    CreatedAt       time.Time `json:"createdAt"`
    UpdatedAt       time.Time `json:"updatedAt"`
}

type GradeAppeal struct {
    ID        string    `json:"id"`
    StudentID string    `json:"studentId"`
    GradeID   string    `json:"gradeId"`
    Reason    string    `json:"reason"`
    Status    string    `json:"status"` // "pending", "approved", "rejected"
    Response  string    `json:"response"`
    CreatedAt time.Time `json:"createdAt"`
    UpdatedAt time.Time `json:"updatedAt"`
}
```

---

### 6. **Assignment Service** (`assignment-service`)
**Responsabilité:** Gestion des travaux pratiques, soumissions et corrections

#### Endpoints:
```
GET    /assignments             # Lister les travaux
GET    /assignments/:id         # Détails travail
POST   /assignments             # Créer travail
PUT    /assignments/:id         # Modifier travail
DELETE /assignments/:id         # Supprimer travail

GET    /submissions             # Lister soumissions
POST   /submissions             # Soumettre travail
PUT    /submissions/:id/grade   # Corriger soumission
GET    /assignments/:aid/submissions # Soumissions d'un travail
```

#### Modèles:
```go
type Assignment struct {
    ID          string    `json:"id"`
    CourseID    string    `json:"courseId"`
    Title       string    `json:"title"`
    Description string    `json:"description"`
    Type        string    `json:"type"` // "Formulaire", "Project"
    DueDate     time.Time `json:"dueDate"`
    CreatedAt   time.Time `json:"createdAt"`
}

type Submission struct {
    ID           string    `json:"id"`
    AssignmentID string    `json:"assignmentId"`
    StudentID    string    `json:"studentId"`
    SubmittedAt  time.Time `json:"submittedAt"`
    Content      string    `json:"content"`
    FileURL      string    `json:"fileUrl"`
    Grade        float64   `json:"grade"`
    Feedback     string    `json:"feedback"`
}
```

---

### 7. **Admin Service** (`admin-service`)
**Responsabilité:** Gestion administrative (inscriptions, locaux, apparitorat)

#### Endpoints:
```
GET    /registrations          # Inscriptions en attente
POST   /registrations/:id/approve # Approuver inscription
DELETE /registrations/:id/reject   # Rejeter inscription

GET    /rooms                  # Lister salles
GET    /rooms/:id              # Détails salle
POST   /rooms                  # Créer salle
PUT    /rooms/:id              # Modifier salle
DELETE /rooms/:id              # Supprimer salle
GET    /rooms/:id/occupancy    # Taux d'occupation

GET    /admin/statistics       # Stats administratives
```

#### Modèles:
```go
type Room struct {
    ID       string    `json:"id"`
    Name     string    `json:"name"`
    Capacity int       `json:"capacity"`
    Building string    `json:"building"`
    Floor    int       `json:"floor"`
    Type     string    `json:"type"` // "Salle de cours", "Lab", etc.
    CreatedAt time.Time `json:"createdAt"`
}
```

---

### 8. **Notification Service** (`notification-service`)
**Responsabilité:** Gestion des notifications et annonces

#### Endpoints:
```
POST   /notifications          # Créer notification
GET    /notifications/:role    # Notifications par rôle
PATCH  /notifications/:id/read # Marquer comme lue
PATCH  /notifications/read-all # Marquer tout comme lu

GET    /announcements          # Lister annonces
POST   /announcements          # Créer annonce
PUT    /announcements/:id      # Modifier annonce
DELETE /announcements/:id      # Supprimer annonce
```

#### Modèles:
```go
type Notification struct {
    ID         string    `json:"id"`
    Type       string    `json:"type"` // "grade_modified", "new_appeal", etc.
    Message    string    `json:"message"`
    TargetRole string    `json:"targetRole"`
    Read       bool      `json:"read"`
    Metadata   map[string]interface{} `json:"metadata"`
    CreatedAt  time.Time `json:"createdAt"`
}

type Announcement struct {
    ID       string    `json:"id"`
    Title    string    `json:"title"`
    Body     string    `json:"body"`
    Author   string    `json:"author"`
    Date     string    `json:"date"`
    Audience string    `json:"audience"` // "student", "teacher", "all"
    Priority string    `json:"priority"` // "info", "warning"
    Scope    string    `json:"scope"` // "global", "faculty"
    CreatedAt time.Time `json:"createdAt"`
}
```

---

### 9. **Report Service** (`report-service`)
**Responsabilité:** Génération de rapports, statistiques, exports PDF/Excel

#### Endpoints:
```
GET    /reports/grades/pdf     # Export notes PDF
GET    /reports/grades/excel   # Export notes Excel
GET    /reports/statistics     # Statistiques globales
GET    /reports/faculty/:fid   # Rapport par faculté
GET    /reports/performance    # Analyse de performance
```

---

## 🗄️ Architecture Base de Données

### PostgreSQL Schema Principal

```sql
-- Users & Auth
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Students
CREATE TABLE students (
    id VARCHAR(50) PRIMARY KEY,
    user_id UUID UNIQUE,
    first_name VARCHAR(255),
    middle_name VARCHAR(255),
    last_name VARCHAR(255),
    birth_date DATE,
    gender CHAR(1),
    matricule VARCHAR(100) UNIQUE,
    faculty_id VARCHAR(50),
    promotion_id VARCHAR(50),
    status VARCHAR(50),
    phone_number VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (faculty_id) REFERENCES faculties(id),
    FOREIGN KEY (promotion_id) REFERENCES promotions(id)
);

-- Teachers
CREATE TABLE teachers (
    id VARCHAR(50) PRIMARY KEY,
    user_id UUID UNIQUE,
    first_name VARCHAR(255),
    middle_name VARCHAR(255),
    last_name VARCHAR(255),
    email VARCHAR(255),
    matricule VARCHAR(100) UNIQUE,
    title VARCHAR(100),
    faculty_id VARCHAR(50),
    department VARCHAR(255),
    phone_number VARCHAR(20),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (faculty_id) REFERENCES faculties(id)
);

-- Faculties
CREATE TABLE faculties (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    dean VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Promotions
CREATE TABLE promotions (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    year INT,
    faculty_id VARCHAR(50),
    created_at TIMESTAMP,
    FOREIGN KEY (faculty_id) REFERENCES faculties(id)
);

-- Courses
CREATE TABLE courses (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    credits INT,
    hours INT,
    teacher_id VARCHAR(50),
    promotion_id VARCHAR(50),
    faculty_id VARCHAR(50),
    room_id VARCHAR(50),
    status VARCHAR(50),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id),
    FOREIGN KEY (promotion_id) REFERENCES promotions(id),
    FOREIGN KEY (faculty_id) REFERENCES faculties(id),
    FOREIGN KEY (room_id) REFERENCES rooms(id)
);

-- Grades
CREATE TABLE grades (
    id VARCHAR(50) PRIMARY KEY,
    student_id VARCHAR(50),
    course_id VARCHAR(50),
    promotion_id VARCHAR(50),
    score DECIMAL(5, 2),
    type VARCHAR(50),
    session VARCHAR(255),
    assessment_title VARCHAR(255),
    status VARCHAR(50),
    title VARCHAR(255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (promotion_id) REFERENCES promotions(id),
    INDEX idx_student_course (student_id, course_id),
    INDEX idx_status (status)
);

-- Schedules
CREATE TABLE schedules (
    id VARCHAR(50) PRIMARY KEY,
    course_id VARCHAR(50),
    teacher_id VARCHAR(50),
    room_id VARCHAR(50),
    promotion_id VARCHAR(50),
    day VARCHAR(20),
    start_time VARCHAR(5),
    end_time VARCHAR(5),
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (teacher_id) REFERENCES teachers(id),
    FOREIGN KEY (room_id) REFERENCES rooms(id),
    FOREIGN KEY (promotion_id) REFERENCES promotions(id),
    INDEX idx_room_time (room_id, day, start_time)
);

-- Rooms
CREATE TABLE rooms (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    capacity INT,
    building VARCHAR(100),
    floor INT,
    type VARCHAR(100),
    created_at TIMESTAMP
);

-- Grade Appeals
CREATE TABLE grade_appeals (
    id VARCHAR(50) PRIMARY KEY,
    student_id VARCHAR(50),
    grade_id VARCHAR(50),
    reason TEXT,
    status VARCHAR(50),
    response TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (grade_id) REFERENCES grades(id)
);

-- Assignments
CREATE TABLE assignments (
    id VARCHAR(50) PRIMARY KEY,
    course_id VARCHAR(50),
    title VARCHAR(255),
    description TEXT,
    type VARCHAR(100),
    due_date TIMESTAMP,
    created_at TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- Submissions
CREATE TABLE submissions (
    id VARCHAR(50) PRIMARY KEY,
    assignment_id VARCHAR(50),
    student_id VARCHAR(50),
    submitted_at TIMESTAMP,
    content TEXT,
    file_url VARCHAR(500),
    grade DECIMAL(5, 2),
    feedback TEXT,
    FOREIGN KEY (assignment_id) REFERENCES assignments(id),
    FOREIGN KEY (student_id) REFERENCES students(id)
);

-- Notifications
CREATE TABLE notifications (
    id VARCHAR(50) PRIMARY KEY,
    type VARCHAR(100),
    message TEXT,
    target_role VARCHAR(50),
    read BOOLEAN DEFAULT FALSE,
    metadata JSONB,
    created_at TIMESTAMP,
    INDEX idx_role_read (target_role, read)
);

-- Announcements
CREATE TABLE announcements (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255),
    body TEXT,
    author VARCHAR(255),
    date DATE,
    audience VARCHAR(50),
    priority VARCHAR(20),
    scope VARCHAR(50),
    created_at TIMESTAMP
);
```

### Redis Keys Pattern
```
# Cache
user:{id}                      # User profile cache
student:{id}                   # Student cache
teacher:{id}                   # Teacher cache
course:{id}                    # Course cache
schedule:{id}                  # Schedule cache
grades:student:{sid}           # Student grades
notifications:{role}           # Notifications by role

# Sessions
session:{token}                # Session data
refresh_token:{token}          # Refresh token data

# Queue
notifications:queue            # Message queue pour notifications
emails:queue                   # Queue pour envois d'emails
```

---

## 📡 Communication Inter-Services

### gRPC pour Communication Interne
```protobuf
// proto/student.proto
syntax = "proto3";

package student;

service StudentService {
  rpc GetStudent(GetStudentRequest) returns (StudentResponse);
  rpc ListStudents(ListStudentsRequest) returns (ListStudentsResponse);
  rpc CreateStudent(CreateStudentRequest) returns (StudentResponse);
  rpc UpdateStudent(UpdateStudentRequest) returns (StudentResponse);
}

message GetStudentRequest {
  string id = 1;
}

message StudentResponse {
  string id = 1;
  string firstName = 2;
  string lastName = 3;
  string email = 4;
  string facultyId = 5;
  string promotionId = 6;
  string status = 7;
}
```

### Event-Driven avec RabbitMQ/Kafka
```
Events publiés:
- student.created
- student.updated
- grade.modified
- course.assigned
- appeal.submitted
- notification.created

Topics:
- academic-events
- student-events
- grade-events
- notification-events
```

---

## 🔒 Sécurité & RBAC

### JWT Token Structure
```json
{
  "sub": "user_id",
  "role": "student|teacher|apparitorat|secretariat_faculte|secretariat_general|rectorat",
  "email": "user@example.com",
  "faculty_id": "optional_faculty_id",
  "exp": 1234567890,
  "iat": 1234567800
}
```

### Middleware & Guards
```
- AuthMiddleware: Valider JWT sur chaque requête
- RoleGuard: Vérifier les permissions selon le rôle
- FacultyGuard: Limiter l'accès aux données de sa faculté (pour secretariat_faculte)
- RateLimiter: Limiter les requêtes par utilisateur
- CORS: Configuration pour le frontend React
```

---

## 🚀 Déploiement & Orchestration

### Docker Compose (Développement)
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: ista_portal
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7
    volumes:
      - redis_data:/data

  rabbitmq:
    image: rabbitmq:3.12-management
    environment:
      RABBITMQ_DEFAULT_USER: admin
      RABBITMQ_DEFAULT_PASS: password
    ports:
      - "5672:5672"
      - "15672:15672"

  # Services
  auth-service:
    build: ./services/auth-service
    environment:
      DATABASE_URL: postgres://admin:password@postgres:5432/ista_portal
      REDIS_URL: redis://redis:6379
      JWT_SECRET: your_secret_key
    ports:
      - "50051:50051"

  student-service:
    build: ./services/student-service
    environment:
      DATABASE_URL: postgres://admin:password@postgres:5432/ista_portal
      REDIS_URL: redis://redis:6379
    ports:
      - "50052:50052"

  # ... autres services

  api-gateway:
    image: kong:3.0
    environment:
      KONG_DATABASE: postgres
      KONG_PG_HOST: postgres
      KONG_PG_USER: admin
      KONG_PG_PASSWORD: password
    ports:
      - "8000:8000"
      - "8443:8443"
      - "8001:8001"

volumes:
  postgres_data:
  redis_data:
```

### Kubernetes (Production)
```yaml
# k8s/student-service.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: student-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: student-service
  template:
    metadata:
      labels:
        app: student-service
    spec:
      containers:
      - name: student-service
        image: theneosoftdevs/student-service:latest
        ports:
        - containerPort: 50052
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
        - name: REDIS_URL
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: redis_url
        livenessProbe:
          grpc:
            port: 50052
          initialDelaySeconds: 10
          periodSeconds: 10
        readinessProbe:
          grpc:
            port: 50052
          initialDelaySeconds: 5
          periodSeconds: 5
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"

---
apiVersion: v1
kind: Service
metadata:
  name: student-service
spec:
  selector:
    app: student-service
  ports:
  - port: 50052
    targetPort: 50052
  type: ClusterIP
```

---

## 📁 Structure des Services

```
services/
├── auth-service/
│   ├── main.go
│   ├── handlers/
│   │   ├── auth.go
│   │   └── user.go
│   ├── models/
│   │   └── user.go
│   ├── db/
│   │   └── postgres.go
│   ├── middleware/
│   │   └── jwt.go
│   ├── Dockerfile
│   └── go.mod
│
├── student-service/
│   ├── main.go
│   ├── handlers/
│   ├── models/
│   ├── db/
│   ├── Dockerfile
│   └── go.mod
│
├── grade-service/
│   ├── main.go
│   ├── handlers/
│   ├── models/
│   ├── db/
│   ├── Dockerfile
│   └── go.mod
│
└── ... (autres services)

proto/
├── student.proto
├── grade.proto
├── academic.proto
└── ... (autres définitions)

api-gateway/
├── kong.conf
└── routes.yaml

k8s/
├── namespaces.yaml
├── configmaps.yaml
├── secrets.yaml
├── postgres.yaml
├── redis.yaml
├── student-service.yaml
└── ... (autres services)

docker-compose.yml
```

---

## 📊 Monitoring & Observabilité

### Stack de Monitoring
- **Prometheus:** Collecte des métriques
- **Grafana:** Dashboards de visualisation
- **Jaeger:** Distributed tracing
- **ELK Stack:** Logs centralisés (Elasticsearch, Logstash, Kibana)

### Metriques Clés
```
# Requêtes
http_requests_total
http_request_duration_seconds
http_requests_in_progress

# Données
students_total
teachers_total
grades_total
courses_total

# Business
grades_pending_total
appeals_pending_total
students_registered_pending
```

---

## 🔄 Processus de Migration (Frontend → Backend)

1. **Phase 1:** Mise en place infrastructure (BD, services de base)
2. **Phase 2:** Implémentation Auth Service + intégration frontend
3. **Phase 3:** Implémentation Student Service + Grade Service
4. **Phase 4:** Implémentation Academic Service + Assignment Service
5. **Phase 5:** Notification Service + Report Service
6. **Phase 6:** Tests d'intégration + optimisations performance
7. **Phase 7:** Déploiement staging + load testing
8. **Phase 8:** Déploiement production

---

## 🛠️ Technologies Stack Recommandées

| Composant | Technologie | Justification |
|-----------|-------------|---------------|
| Framework Web | Gin / Echo | Performance, middlewares, routing |
| ORM | GORM | Migration DB, queries fluides |
| Validation | Validator/v10 | Validation structs robuste |
| Logging | Zap / Logrus | Structured logging haute performance |
| Testing | Testify | Assertions et mocks |
| CI/CD | GitHub Actions | Déjà sur GitHub |
| Container Registry | Docker Hub / GitHub Container Registry | Pull depuis CI/CD |
| Monitoring | Prometheus + Grafana | Open source, standard industrie |

---

## 📝 Étapes Prochaines

1. Créer dépôt `istapp-backend` avec structure microservices
2. Implémenter Auth Service en premier (bloc critique)
3. Configurer PostgreSQL + Redis en local
4. Créer proto files pour gRPC
5. Intégrer API Gateway Kong
6. Mettre en place CI/CD avec GitHub Actions
7. Écrire tests unitaires & d'intégration
8. Documentation OpenAPI/Swagger pour chaque service

---

**Architecture créée le:** 5 Juin 2026  
**Version:** 1.0  
**Status:** Design Phase ✅
