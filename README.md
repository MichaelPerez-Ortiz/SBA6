# SBA6

**Video Game Reviews API**


***GET Routes /Read***

**Games**

- /games

- /games?genre=
- /games?developer=
- /games?platform= 
- /games?minRating=
- /games?sortBy=:  rating / release / title(Shows games in Alphabetical Order)
-  limit=


- /games/:title
- Returns game by title (case-insensitive search)- 


**Reviews**


- /reviews

- /reviews/:game
- Searches by Game title 

- reviews/:game?sortBy=: rating / oldest
-  limit=

- /reviews/users/:id
- Returns reviews by a specific user


**Users**

- /users
- users?role=: user / admin /moderator
- users?sortBy=: oldest
-  limit=

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



**POST Request Templates**

*games*

{
  "title": "" ,
  "developer": "" ,
  "releaseDate": "" ,
  "genre": "" ,
  "platform": "" ,
  "description": "" ,
  "coverImage": ""
}

Required = title & platform


*reviews*

{
  "game": "",
  "user": "" ,
  "rating": "" ,
  "review": ""
}

Required = All 
*Need to use the user _id. This was to account for username changes.


*users*

{
  "username": "",
  "email": "" ,
  "password": "" ,
  "role": "",
  "avatar": ""
}

Required = username , email & password