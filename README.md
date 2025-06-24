# SBA6

**Video Game Reviews API**


***GET Routes /Read***

**Games**

- /games

- /games?genre=
- /games?developer=
- /games?platform= 
- /games?minRating=
- /games?sortBy=: Sort by rating, release or title
- &limit=


- /games/:title
- Returns game by title (case-insensitive search)- 


**Reviews**


- /reviews

- /reviews/:game
- Searches by Game title 

- reviews?sortBy=: Sort by rating or oldest entry date
-&limit=

- /reviews/users/:id
- Returns reviews by a specific user


**Users**

-/users
- Returns all users (without email addresses or passwords)

- /users/:id




***POST Routes /Create***


- /games

- /reviews

- /users


***PATCH Routes /Update***


- /games/:id

- /reviews/:id

- /users/:id


***DELETE Routes /Delete***



- /games/:id

- /reviews/:id

- /users/:id