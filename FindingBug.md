Đọc THẬT KĨ toàn bộ CLAUDE.md trước.

KHÔNG được bắt đầu phân tích code trước khi hiểu 100% kiến trúc, conventions, coding rules, business flow, folder structure, API contract và các yêu cầu trong CLAUDE.md.

Sau đó thực hiện một cuộc audit toàn bộ project ở mức Senior Staff Engineer + Security Engineer + QA Lead + SRE.

Mục tiêu:

KHÔNG sửa code ngay.

Chỉ tập trung PHÁT HIỆN CÀNG NHIỀU LỖI CÀNG TỐT.

======================================================================
PHASE 1 — BUILD GLOBAL UNDERSTANDING
======================================================================

Trước tiên hãy:

1. Đọc toàn bộ CLAUDE.md.

2. Tóm tắt:

- Architecture
- Folder structure
- Module dependencies
- Business flows
- Database design
- API contracts
- Coding conventions
- Security requirements
- Error handling conventions
- Testing strategy

3. Xây dựng dependency graph của toàn bộ project.

4. Liệt kê:

- Controllers
- Services
- Models
- Repositories
- Middlewares
- Utils
- Routes
- Components
- Hooks
- Contexts
- Stores
- APIs
- Database tables

5. Vẽ mental map của toàn bộ hệ thống.

KHÔNG sửa gì ở phase này.

======================================================================
PHASE 2 — STATIC CODE AUDIT
======================================================================

Quét toàn bộ source code.

Phát hiện:

### Syntax issues

- import sai
- circular dependency
- dead code
- duplicated code
- unused variables
- unreachable code

### Logic issues

- branch thiếu else
- null pointer
- undefined
- race condition
- async bug
- await thiếu
- promise leak
- infinite loop
- memory leak

### API issues

- request/response mismatch
- HTTP status sai
- thiếu validation
- response shape không đồng bộ
- field naming inconsistency
- DTO mismatch
- frontend gọi sai API
- backend trả sai schema

### Database issues

- foreign key mismatch
- nullable sai
- transaction thiếu
- rollback thiếu
- duplicate data
- race condition khi insert
- N+1 query
- missing index
- query inefficiency

### Authentication

- JWT handling
- token expiration
- refresh token flow
- session bug
- privilege escalation
- missing authorization

### Security

OWASP Top 10:

- SQL injection
- XSS
- CSRF
- SSRF
- Path traversal
- Command injection
- Open redirect
- Broken access control
- IDOR
- Sensitive data exposure

### Error handling

- try catch thiếu
- swallowed exception
- inconsistent error response
- stack trace leak

### Environment

- env variable thiếu
- hardcoded secret
- hardcoded URL
- duplicated config

### Performance

- unnecessary re-render
- heavy computation
- blocking I/O
- excessive API calls
- repeated DB queries
- memory waste

### Concurrency

- race condition
- deadlock
- shared state issue
- stale cache

### Frontend

React:

- dependency array sai
- stale closure
- memory leak
- infinite render
- state mutation
- key prop issue

UI:

- loading state thiếu
- empty state thiếu
- error state thiếu
- optimistic update bug

### Backend

Express/Nest/FastAPI:

- middleware order bug
- async issue
- route conflict
- duplicate endpoint
- inconsistent response

======================================================================
PHASE 3 — CROSS FILE ANALYSIS
======================================================================

Không phân tích từng file độc lập.

Luôn kiểm tra consistency giữa:

Frontend
↕
API
↕
Controller
↕
Service
↕
Repository
↕
Database

Phát hiện:

- mismatch field names
- mismatch types
- missing required field
- response shape inconsistency
- hidden bug giữa nhiều file

======================================================================
PHASE 4 — BUSINESS LOGIC REVIEW
======================================================================

Mô phỏng user flow:

Signup
Login
CRUD
Search
Pagination
Upload
Delete
Invitation
Family flow
Permission flow
Admin flow

Phát hiện:

- edge cases
- invalid states
- impossible states
- missing validation
- duplicated actions
- inconsistent business rules

======================================================================
PHASE 5 — API CONTRACT AUDIT
======================================================================

Kiểm tra:

Request

Headers
Params
Body
Query

Response

status code
shape
message
error format

Đảm bảo frontend và backend khớp 100%.

Tìm:

- API thừa
- API chết
- API không được dùng
- API route conflict
- duplicated endpoint

======================================================================
PHASE 6 — DATABASE AUDIT
======================================================================

Kiểm tra:

tables
constraints
indexes
transactions
cascade delete
foreign keys

Phát hiện:

- orphan records
- duplicated records
- integrity violation
- migration bug

======================================================================
PHASE 7 — TEST COVERAGE ANALYSIS
======================================================================

Kiểm tra:

Unit tests
Integration tests
E2E tests

Liệt kê:

- phần chưa được test
- critical path chưa test
- edge cases chưa test

======================================================================
PHASE 8 — SECURITY AUDIT
======================================================================

Review theo OWASP Top 10.

Kiểm tra:

Authentication
Authorization
Session
Cookies
JWT
File upload
Rate limiting
Input validation

Tìm mọi khả năng:

- privilege escalation
- account takeover
- IDOR
- token leak
- secret leak

======================================================================
PHASE 9 — REPORT
======================================================================

KHÔNG sửa code ngay.

Sinh một báo cáo markdown cực chi tiết:

# Executive Summary

- số lượng lỗi
- mức độ nghiêm trọng

# Critical
(severity 10)

# High
(severity 8-9)

# Medium
(severity 5-7)

# Low
(severity 1-4)

Mỗi lỗi phải có:

## ID
BUG-001

## Severity

Critical / High / Medium / Low

## Category

API / Security / Database / Frontend / Backend / Performance / Logic

## Files involved

liệt kê đầy đủ

## Root cause

giải thích nguyên nhân

## Reproduction

cách tái hiện

## Impact

ảnh hưởng thực tế

## Recommended fix

hướng sửa

## Confidence

High / Medium / Low

======================================================================

Luôn ưu tiên PHÁT HIỆN TỐI ĐA BUG.

Không tối ưu code.

Không refactor.

Không tự sửa.

Chỉ tạo BUG REPORT đầy đủ và cực kỳ khắt khe như một cuộc audit production của Google Staff Engineer + Security Team + QA Team.