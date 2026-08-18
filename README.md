K6 Performance Test Framework

1. Load Testing Component

~  food_recipes.json - A JSON dataset containing food recipes with custom fields such as ingredients, instructions, preparation time, cuisine, ratings, calories, etc.

~  restful-api-collection-management.js - A K6 load testing script that has these following steps:
   -  Defines performance thresholds i.e. the response times for 95% of requests < 500 ms and 99% of requests < 1000 ms.
   -  Loads whole recipe data from the input json file.
   -  Creates recipe objects during setup().
   -  Performs load testing using a ramping-vus executor, allowing gradual scaling of virtual users over a specified time duration.
   -  Randomly retrieves recipe objects during the test execution.
   -  Cleans up all created objects in teardown().
