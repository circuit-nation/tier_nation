# Tier Nation

A dynamic ranking platform by Circuit Nation where motorsport fans can explore and compare the greatest drivers, races, and circuits of all time.

### Working Todo

#### Server

- [x] Setup basic authentication using Google OAuth
- [ ] Database setup
  - [x] Integrate Neon Database and ORM [https://neon.com/guides/golang-gorm-postgres]
  - [x] Auth Schema creation
  - [ ] Data Schema creation
    - [ ] Lists
    - [ ] Tiers as Object of Objects
    - [ ] Entities
  - [ ] Submissions Schema
    - [ ] Votes
    - [ ] Submissions
- [ ] Data related APIs (requires admin auth)
  - [ ] Create new service to handle auth from admin dashboard.
  - [ ] Create API to add lists
  - [ ] Create API to add entities
- [ ] Submission related APIs
  - [ ] Allow submissions
- [ ] Average position calculation
  - [ ] Calculate average position for each entity based on submissions
  - [ ] Add APIs for that (authenticated)
- [ ] List related APIs
  - [ ] Archive lists

#### Client

- [x] Basic layout and drag drop functionality
- [x] Ranking page design with mock data
  - [x] Create a mock ranking page as per the schema with all the entities
- [x] Submission workflow
  - [x] Errors and Warnings
- [x] Landing page design

### Ideas

- How to calculate average positions?
- ⁠Only show the avg score to the user, (logged in users) after submission - blurred bg, with login button for anonymous users
  ⁠social snapshot like sharing for the leaderboards
- ⁠ask users about what kindof fan they are? (new, veteran etc.)
- ⁠on home page, we can have a right sidebar, showing the current CN updates, blogs, videos etc.
