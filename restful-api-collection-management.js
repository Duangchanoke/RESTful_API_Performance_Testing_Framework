import { check, sleep } from 'k6';
import http from 'k6/http';
import { SharedArray } from 'k6/data';

const api_keys = '2ef052de-4631-482d-95b2-c60d90383026';
const number_of_recipes = 9;

export const options = {
    scenarios: {
        ramping_updown_scenario: {
            exec: 'get_collections',
            executor: 'ramping-vus',
            stages: [
                { duration: '5s',  target: 5  },
                { duration: '10s', target: 10 },
                { duration: '5s',  target: 0  }
            ]
        }
    },
    thresholds: {
        http_req_duration: ['p(95)<500', 'p(99)<1000'],
        http_req_failed: ['rate<0.01']
    }
}

const foods = new SharedArray('food_recipes', function () {
    return JSON.parse(open('./food_recipes.json'));
});

export function setup() {
    const id_list = [];
    for (var i = 0; i < number_of_recipes; i++) {
        const post_url = 'https://api.restful-api.dev/collections/food-recipes/objects'
        const response = http.post(
            post_url,
            JSON.stringify(foods[i]),
            {
                headers: {
                    'x-api-key': api_keys,
                    'Content-Type': 'application/json'
                },
            }
        )

        const isSuccess = check(response, {
            'Successfully Added Food Recipes': (r) => r.status === 200
        });

        if (isSuccess) {
            let data = response.json('id');
            id_list.push(data);
            console.log(`Created Food Recipe ID: ${data}`);
        }
    }
    return { ids: id_list };
}

export function get_collections(data) { 
    const ids = data.ids;
    if (!ids || ids.length === 0) {
        console.error('No Food Recipe Available');
        return;
    }

    const id = ids[Math.floor(Math.random() * ids.length)];

    const get_url = `https://api.restful-api.dev/collections/food-recipes/objects?id=${id}`
    const response = http.get(
        get_url,
        {
            headers: {
                'x-api-key': api_keys
            },
        }
    );

    check(response, {
        'Get Collections - HTTP status of 200': (res) => res.status === 200
    });
    
    console.log(`VU ${__VU} \tIteration ${__ITER} \t\tStatus: ${response.status}`);

    sleep(1);
}

export function teardown(data) {
    const ids = data.ids;
    for (var i = 0; i < ids.length; i++) {
        let id = ids[i];
        let delete_url = `https://api.restful-api.dev/collections/food-recipes/objects/${id}`
        const response = http.del(
            delete_url,
            null,
            {
                headers: {
                    'x-api-key': api_keys
                }
            }
        );
        check(response, {
            'Successfully Removed Food Recipes': (r) => r.status === 200
        });
    }
}