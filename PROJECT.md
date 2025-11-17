# KampusRate - RateMyProfessor for Indonesia

A comprehensive platform for Indonesian students to review and discover lecturers and courses, with verified campus email authentication.

## 🎯 Core Concept

Students can search, browse, and review lecturers and courses **only after verifying their campus email**. Each campus has trusted email domains (e.g., `ui.ac.id`, `itb.ac.id`), and users must verify an email from these domains to leave reviews for that campus.

---

## 📋 Product Requirements

### User Roles

- **Visitor**: Browse campuses, lecturers, courses, and read reviews
- **Student (logged in)**: + Start campus verification, but cannot review until verified
- **Verified Student**: + Leave reviews for verified campuses, join campus communities
- **Lecturer**: + Claim lecturer profile, reply to reviews, edit bio
- **Admin**: Approve campuses, manage email domains, moderate content

### Core Features

1. **Campus Management**
   - Users can propose new campuses (status: pending)
   - Admins approve campuses and set email domains
   - Active campuses show stats (lecturer count, review count, avg quality)

2. **Email Verification**
   - Users select campus and enter campus email
   - System validates email domain against campus.emailDomains
   - Verification token sent to email
   - Token expires in 24 hours
   - Users can have multiple verified campuses

3. **Lecturer Reviews**
   - Only verified students can review
   - Ratings: Overall (1-5), Clarity, Fairness, Difficulty
   - Optional: Comment, tags, course, term
   - Can be posted anonymously
   - One review per lecturer per user
   - Reviews can be voted helpful/not helpful
   - Reviews can be reported and hidden by admins

4. **Community**
   - Campus-specific discussion boards
   - Verified students can post
   - Categories: discussion, question, event
   - Comments support nested replies

---

## 🏗️ Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS
- **Backend**: Convex (TypeScript schema + queries/mutations)
- **Auth**: Better Auth (with Google OAuth + Email/Password)
- **UI Components**: Radix UI, Lucide Icons, Motion (animations)

---

## 📁 Project Structure

```
/app
  /api/auth/[...all]     # Better Auth API routes
  /(auth)                # Auth pages (login, signup)
  /campuses              # Campus listing & details
    /[campusSlug]        # Campus overview
      /community         # Campus-specific community
  /lecturers             # Lecturer search & profiles
    /[campusSlug]/[lecturerSlug]  # Lecturer profile
      /review            # Create review form
  /courses               # Course pages
    /[campusSlug]/[courseSlug]
  /me                    # User profile & verifications
    /reviews             # User's reviews
    /settings            # User settings
  /admin                 # Admin dashboard
    /campuses            # Approve pending campuses
    /reports             # Moderate reported content

/convex
  schema.ts              # Convex database schema
  users.ts               # User management
  campuses.ts            # Campus CRUD + approval
  lecturers.ts           # Lecturer search & profiles
  reviews.ts             # Review creation & moderation
  emailVerifications.ts  # Email verification flow
  community.ts           # Community posts & comments

/lib
  auth.ts                # Better Auth server config
  auth-client.ts         # Better Auth client hooks
  utils.ts               # Utility functions

/components
  /ui                    # Reusable UI components
  /providers             # Context providers
```

---

## 🗄️ Data Model

### Core Tables

**users**
- authId (Better Auth ID)
- email, name, avatarUrl
- role: "student" | "lecturer" | "admin"

**campuses**
- name, slug, city, type
- emailDomains: string[] (trusted email domains)
- status: "active" | "pending" | "rejected"
- submittedByUserId (optional)

**emailVerifications**
- userId, campusId
- email, domain
- token (for verification link)
- isVerified, verifiedAt
- expiresAt

**lecturers**
- campusId
- name, slug, title, department
- bio, photoUrl
- claimedByUserId (optional)
- reviewCount, avgOverall, avgClarity, avgFairness, avgDifficulty

**courses**
- campusId
- code, name, slug
- sks, type, recommendedSemester

**reviews**
- campusId, lecturerId, courseId, authorId
- ratingOverall, ratingClarity, ratingFairness, ratingDifficulty
- comment, tags[], term
- isAnonymous, isReported, isHidden
- helpfulScore

**reviewVotes**
- reviewId, userId, value (+1/-1)

**communityPosts**
- campusId, authorId
- title, body, category

**comments**
- postId or reviewId
- authorId, body
- parentCommentId (for nested replies)

---

## 🔒 Authentication & Authorization

### Better Auth Setup

Better Auth is configured in:
- `/lib/auth.ts` - Server-side auth instance
- `/lib/auth-client.ts` - Client hooks (useSession, signIn, signOut, signUp)
- `/app/api/auth/[...all]/route.ts` - API handler

### Providers
- Google OAuth
- Email/Password

### Auth Flow
1. User signs up/in via Better Auth
2. Better Auth creates session
3. Frontend calls `convex/users.getOrCreateUser` to sync user in Convex
4. User gets authId stored in Convex `users` table
5. All Convex mutations check authId for authorization

### Permission Checks

**Review Creation**:
```typescript
// Check if user is verified for campus
const verification = await ctx.db
  .query("emailVerifications")
  .withIndex("by_user_campus", q =>
    q.eq("userId", userId).eq("campusId", campusId))
  .filter(q => q.eq(q.field("isVerified"), true))
  .unique();

if (!verification) {
  throw new Error("Must verify campus email first");
}
```

**Admin Actions**:
```typescript
const admin = await ctx.db
  .query("users")
  .withIndex("by_authId", q => q.eq("authId", adminAuthId))
  .unique();

if (!admin || admin.role !== "admin") {
  throw new Error("Admin access required");
}
```

---

## 🔄 Key User Flows

### 1. Email Verification Flow

```
User → /me → "Verify Campus Email"
  ↓
Select campus → Enter email (@ui.ac.id)
  ↓
System checks email domain ∈ campus.emailDomains
  ↓
Create emailVerifications record + send token email
  ↓
User clicks link → /verify?token=xxx
  ↓
Mark isVerified=true → User can now review
```

### 2. Create Review Flow

```
User → /lecturers/[campus]/[lecturer] → "Write Review"
  ↓
Check if user is verified for this campus
  ↓
If not verified → Redirect to verification
  ↓
If verified → Show review form
  ↓
Submit ratings + comment + tags
  ↓
Create review → Update lecturer aggregates
```

### 3. New Campus Submission

```
User → /campuses → "Submit New Campus"
  ↓
Fill: name, city, website, suggested domain
  ↓
Create campus with status="pending"
  ↓
Admin → /admin/campuses → See pending
  ↓
Admin approves → Set emailDomains + status="active"
```

---

## 🎨 UI/UX Patterns

- **Dark Mode**: Implemented via next-themes
- **Mobile-First**: Responsive design with Tailwind
- **Loading States**: Convex queries handle loading/error states
- **Animations**: Motion library for smooth transitions
- **Accessibility**: Radix UI components are accessible by default

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env.local`:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_CONVEX_URL=<your-convex-url>

DATABASE_URL=file:./better-auth.db
BETTER_AUTH_SECRET=<generate-random-secret>
GOOGLE_CLIENT_ID=<from-google-console>
GOOGLE_CLIENT_SECRET=<from-google-console>

# Email (optional for now)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
```

### 3. Run Development Server

```bash
# Terminal 1: Start Convex
npx convex dev

# Terminal 2: Start Next.js
pnpm dev
```

Visit `http://localhost:3001`

---

## 📝 Convex Queries & Mutations

### Users
- `getOrCreateUser` - Sync Better Auth user to Convex
- `getCurrentUser` - Get user + verified campuses
- `updateUserRole` - Admin: change user role

### Campuses
- `listCampuses` - Get all active campuses (with stats)
- `getCampusBySlug` - Get campus details + top lecturers
- `submitCampus` - User: propose new campus
- `approveCampus` / `rejectCampus` - Admin actions
- `searchCampuses` - Search by name/city

### Lecturers
- `searchLecturers` - Search with filters (campus, term)
- `getLecturerBySlug` - Get lecturer profile + reviews
- `getOrCreateLecturer` - Auto-create on first review
- `claimLecturer` - Lecturer: claim profile
- `updateLecturerBio` - Lecturer: edit bio

### Reviews
- `createReview` - Student: leave review (checks verification)
- `voteOnReview` - Vote helpful/not helpful
- `reportReview` - Report abusive review
- `hideReview` - Admin: hide review
- `getUserReviews` - Get user's reviews

### Email Verifications
- `startVerification` - Send verification email
- `verifyEmail` - Verify with token
- `getUserVerifications` - Get user's verified campuses
- `isUserVerifiedForCampus` - Check verification status

### Community
- `createPost` - Create campus discussion post
- `getCampusPosts` - Get posts for campus
- `addComment` - Comment on post/review
- `reportPost` / `hidePost` - Moderation

---

## 🔐 Security Considerations

1. **Email Verification**: Required before reviewing
2. **Rate Limiting**: Consider adding rate limits to mutations
3. **Input Validation**: All inputs are trimmed/validated
4. **XSS Prevention**: React automatically escapes output
5. **Admin Actions**: Always check role before sensitive operations
6. **Anonymous Reviews**: Store authorId internally but hide publicly

---

## 🎯 Next Steps

### Phase 1: Core MVP (Current)
- ✅ Schema design
- ✅ Auth setup (Better Auth)
- ✅ Core Convex functions
- ⏳ Build main pages (campuses, lecturers, reviews)
- ⏳ Email verification UI
- ⏳ Admin dashboard

### Phase 2: Polish
- [ ] Email sending (SMTP integration)
- [ ] Search optimization (full-text search)
- [ ] Image uploads (lecturer photos, campus logos)
- [ ] Rate limiting
- [ ] Analytics

### Phase 3: Enhancements
- [ ] Course reviews
- [ ] Lecturer response to reviews
- [ ] Advanced search filters
- [ ] Export reviews (CSV)
- [ ] Mobile app (React Native)

---

## 📚 Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Convex Docs**: https://docs.convex.dev
- **Better Auth Docs**: https://www.better-auth.com/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Radix UI**: https://www.radix-ui.com/primitives

---

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes
3. Test thoroughly
4. Commit: `git commit -m "Add my feature"`
5. Push: `git push -u origin feature/my-feature`
6. Create Pull Request

---

## 📄 License

MIT License - see LICENSE file for details
