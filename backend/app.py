from flask import Flask, request, jsonify
from flask_cors import CORS
import random
import time

app = Flask(__name__)
CORS(app, resources={r"/start": {"origins": "*"}})  # Allowing all origins for '/start' route
 # Enable CORS for all routes

# Global game state
game_data = {
    'number': '',
    'start_time': 0,
    'guesses': 0
}

# Function to generate a random 4-digit number with unique digits
def generate_number():
    digits = random.sample(range(10), 4)  # Random unique digits
    return ''.join(map(str, digits))

# Start new game
@app.route('/start', methods=['POST'])
def start_game():
    game_data['number'] = generate_number()  # Set new random number
    game_data['start_time'] = time.time()  # Start the timer
    game_data['guesses'] = 0  # Reset guesses count
    return jsonify({"message": "Game started!"})

# Make a guess
@app.route('/guess', methods=['POST'])
def make_guess():
    data = request.json
    guess = data.get('guess', '')
    
    if len(guess) != 4 or len(set(guess)) != 4 or not guess.isdigit():
        return jsonify({"message": "Invalid guess! Enter a 4-digit number with unique digits."}), 400

    game_data['guesses'] += 1
    
    correct_place = sum(1 for i in range(4) if guess[i] == game_data['number'][i])
    correct_digit = sum(1 for i in range(4) if guess[i] in game_data['number'] and guess[i] != game_data['number'][i])

    if correct_place == 4:
        total_time = time.time() - game_data['start_time']
        return jsonify({
            "message": f"Congratulations! You've guessed the correct number in {game_data['guesses']} guesses and {total_time:.2f} seconds.",
            "correct_place": correct_place,
            "correct_digit": correct_digit,
            "guesses": game_data['guesses'],
            "time": total_time
        })
    else:
        return jsonify({
            "message": f"{correct_place} Place {correct_digit} Digit",
            "correct_place": correct_place,
            "correct_digit": correct_digit
        })

if __name__ == '__main__':
    app.run(debug=True)
