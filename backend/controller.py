from flask import Flask, request, jsonify
from datetime import datetime
from flask_mysqldb import MySQL
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# MySQL configurations
app.config['MYSQL_HOST'] = '127.0.0.1'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = ''
app.config['MYSQL_DB'] = 'Airline'

mysql = MySQL(app)

@app.route('/airlines/<string:airline_code>', methods=['GET'])
def get_airline_by_code(airline_code):
    cursor = mysql.connection.cursor()
    cursor.execute("SELECT * FROM airlines WHERE code = %s", (airline_code,))
    airline_data = cursor.fetchone()
    cursor.close()

    if airline_data is not None:
        # Check if there is at least one row in the result set
        cursor = mysql.connection.cursor()
        cursor.execute("SHOW COLUMNS FROM airlines")
        column_names = [desc[0] for desc in cursor.fetchall()]  # Fetch all column names
        cursor.close()

        # Create a dictionary with column names as keys and data as values
        airline_dict = {column_names[i]: airline_data[i] for i in range(len(column_names))}
        return jsonify(airline_dict), 200
    else:
        return jsonify({"message": "Airline not found"}), 404



@app.route('/airports/<string:airport_code>', methods=['GET'])
def get_airport_by_code(airport_code):
    cursor = mysql.connection.cursor()
    cursor.execute("SELECT * FROM airports WHERE code = %s", (airport_code,))
    airport_data = cursor.fetchone()
    cursor.close()

    if airport_data is not None:
        # Check if there is at least one row in the result set
        cursor = mysql.connection.cursor()
        cursor.execute("SHOW COLUMNS FROM airports")
        column_names = [desc[0] for desc in cursor.fetchall()]  # Fetch all column names
        cursor.close()

        # Create a dictionary with column names as keys and data as values
        airport_dict = {column_names[i]: airport_data[i] for i in range(len(column_names))}
        return jsonify(airport_dict), 200
    else:
        return jsonify({"message": "Airport not found"}), 404

@app.route('/autocomplete', methods=['POST'])
def search_airports_with_autocomplete():
    data = request.get_json()

    keyword = data.get('keyword')

    if not keyword:
        return jsonify({"message": "Missing 'keyword' parameter"}), 400

    # Connect to the MySQL database
    try:
        cursor = mysql.connection.cursor()

        # Query airport details for airports that start with the keyword
        query = """
        SELECT code, name, city, country, lat, lon
        FROM airports
        WHERE name LIKE %s OR code = %s
        """
        cursor.execute(query, (f"{keyword}%", keyword))

        matching_airports = []

        for row in cursor:
            airport_details = {
                "code": row[0],
                "name": row[1],
                "city": row[2],
                "country": row[3],
                "lat": row[4],
                "lon": row[5]
            }
            matching_airports.append(airport_details)

        cursor.close()

        if matching_airports:
            return jsonify(
                {"Keyword": keyword,
                 "matching_airports": matching_airports}), 200
        else:
            return jsonify({"message": "No matching airports found"}), 404

    except mysql.cursor.Error as err:
        return jsonify({"message": f"Database error: {err}"}), 500


@app.route('/routes', methods=['POST'])
def get_routes_by_best_recommendations():
    data = request.get_json()

    routes = data.get('routes', [])  # Retrieve the list of routes

    if not routes:
        return jsonify({"message": "No routes provided in the input"}), 400

    # List to store the results for each route
    route_results = []

    for route_info in routes:
        date = route_info.get('date')
        departure = route_info.get('departure')
        arrival = route_info.get('arrival')
        classes = data.get('class', [])  # Retrieve a list of class values (optional)
        airlines = data.get('airlines', [])  # Retrieve a list of airline codes (optional)

        if not date or not departure or not arrival:
            return jsonify({"message": "Missing required parameters in route info: date, departure, arrival"}), 400

        cursor = mysql.connection.cursor()

        # Convert the given date to a weekday (0 = Monday, 1 = Tuesday, ..., 6 = Sunday)
        try:
            date_obj = datetime.strptime(date, '%Y-%m-%d')
            weekday = date_obj.weekday()
        except ValueError:
            return jsonify({"message": "Invalid date format. Use YYYY-MM-DD format."}), 400

        # Construct the column name for the corresponding weekday (day1, day2, ..., day7)
        weekday_column = f"day{weekday + 1}"

        # Create a list of class conditions if classes are provided
        class_conditions = []
        if classes:
            class_conditions = [f'class_{cls.lower()} = 1' for cls in classes]

        # Create the class_columns string by joining the class conditions with 'OR'
        class_columns = ' OR '.join(class_conditions)

        # Create placeholder strings for the IN conditions based on the number of airline codes provided
        airline_placeholders = ', '.join(['%s'] * len(airlines))

        # Create the WHERE clause based on the presence of class and airline data
        where_clause = f"code_from = %s AND code_to = %s AND {weekday_column} = 'yes'"

        if class_columns:
            where_clause += f" AND ({class_columns})"

        if airlines:
            where_clause += f" AND airline_code IN ({airline_placeholders})"

        # Use the WHERE clause to search for flights with specific departure, arrival, classes, and airlines on the given weekday
        query = f"""
            SELECT * 
            FROM flight_routes 
            WHERE {where_clause}
            """

        # Build the parameter list to include departure, arrival, and airlines
        params = [departure, arrival] + airlines

        # Execute the query with the parameters
        cursor.execute(query, tuple(params))
        routes_data = cursor.fetchall()
        cursor.close()

        if routes_data:
            # Convert the result into a list of dictionaries
            result = []
            for route_data in routes_data:
                cursor = mysql.connection.cursor()
                cursor.execute("SHOW COLUMNS FROM flight_routes")
                column_names = [desc[0] for desc in cursor.fetchall()]  # Fetch all column names
                cursor.close()

                # Create a dictionary with column names as keys and data as values
                route_dict = {column_names[i]: route_data[i] for i in range(len(column_names))}

                # Retrieve airline data
                airline_code = route_dict["airline_code"]
                cursor = mysql.connection.cursor()
                cursor.execute("SELECT * FROM airlines WHERE code = %s", (airline_code,))
                airline_data = cursor.fetchone()
                cursor.close()

                if airline_data:
                    # Create an airline dictionary
                    airline_dict = {
                        "code": airline_data[1],
                        "id": airline_data[0],
                        "is_lowcost": airline_data[3],
                        "logo": airline_data[4],
                        "name": airline_data[2]
                    }
                    route_dict["Airline"] = airline_dict  # Add airline details under "Airline" key

                result.append(route_dict)

            route_result = {
                "date": date,
                "departure": departure,
                "arrival": arrival,
                "results": result,
            }
            route_results.append(route_result)

    # Return the list of route results
    return jsonify(route_results), 200



@app.route('/detailed', methods=['POST'])
def get_detailed_itinerary():
    data = request.get_json()

    route_ids = data.get('routes', [])  # Retrieve the list of route IDs

    if not route_ids:
        return jsonify({"message": "No route IDs provided in the input"}), 400

    cursor = mysql.connection.cursor()

    # List to store the results for each route
    result = []

    for route_id in route_ids:
        # Use the WHERE clause to search for the route with the specified ID
        query = f"""
        SELECT * 
        FROM routes 
        WHERE id = %s
        """

        cursor.execute(query, (route_id,))
        route_data = cursor.fetchone()

        if not route_data:
            result.append({f"{route_id}": "No route matches"})
            continue

        # Get the column names
        cursor.execute("SHOW COLUMNS FROM routes")
        column_names = [desc[0] for desc in cursor.fetchall()]

        # Create a dictionary with column names as keys and data as values
        route_dict = {}
        for i in range(len(column_names)):
            column_name = column_names[i]

            # Exclude renaming for specific columns
            if column_name == "code_from" or column_name == "code_to":
                route_dict[column_name] = route_data[i]
            else:
                # Rename keys as needed for other columns
                route_dict[column_name] = route_data[i]

        result.append(route_dict)

    cursor.close()

    if not result:
        return jsonify({"message": "No matched routes"}), 404

    # Add airline and airport details to the result for each route
    for route_data in result:
        airline_code = route_data.get("airline_code")
        code_from = route_data.get("code_from")
        code_to = route_data.get("code_to")

        # Fetch airline details
        cursor = mysql.connection.cursor()
        cursor.execute("SELECT * FROM airlines WHERE code = %s", (airline_code,))
        airline_data = cursor.fetchone()
        cursor.close()

        if airline_data:
            airline_dict = {
                "code": airline_data[1],
                # "created_on": airline_data[2],
                "id": airline_data[0],
                "is_lowcost": airline_data[3],
                "logo": airline_data[4],
                "name":airline_data[2]
            }
            route_data["airline"] = airline_dict

        # Fetch departure airport details
        cursor = mysql.connection.cursor()
        cursor.execute("SELECT * FROM airports WHERE code = %s", (code_from,))
        airport_from_data = cursor.fetchone()
        cursor.close()

        if airport_from_data:
            airport_from_dict = {
                "city": airport_from_data[5],
                "code": airport_from_data[1],
                "country": airport_from_data[7],
                "id": airport_from_data[0],
                "lat": airport_from_data[2],
                "lon": airport_from_data[3],
                "name": airport_from_data[4],
                "state": airport_from_data[6]
            }
            route_data["Flying_from"] = airport_from_dict

        # Fetch arrival airport details
        cursor = mysql.connection.cursor()
        cursor.execute("SELECT * FROM airports WHERE code = %s", (code_to,))
        airport_to_data = cursor.fetchone()
        cursor.close()

        if airport_to_data:
            airport_to_dict = {
                "city": airport_to_data[5],
                "code": airport_to_data[1],
                "country": airport_to_data[7],
                "id": airport_to_data[0],
                "lat": airport_to_data[2],
                "lon": airport_to_data[3],
                "name": airport_to_data[4],
                "state": airport_to_data[6]
            }
            route_data["Flying_to"] = airport_to_dict

    return jsonify(result), 200

@app.route('/airline', methods=['POST'])
def search_airline_with_autocomplete():
    data = request.get_json()

    keyword = data.get('keyword')

    if not keyword:
        return jsonify({"message": "Missing 'keyword' parameter"}), 400

    # Connect to the MySQL database
    try:
        cursor = mysql.connection.cursor()

        # Query airport details for airports that start with the keyword
        query = """
        SELECT code, name
        FROM airlines
        WHERE name LIKE %s OR code = %s
        """
        cursor.execute(query, (f"{keyword}%", keyword))

        matching_airports = []

        for row in cursor:
            airport_details = {
                "code": row[0],
                "name": row[1],
            }
            matching_airports.append(airport_details)

        cursor.close()

        if matching_airports:
            return jsonify(
                {"Keyword": keyword,
                 "matching_airlines": matching_airports}), 200
        else:
            return jsonify({"message": "No matching airports found"}), 404

    except mysql.cursor.Error as err:
        return jsonify({"message": f"Database error: {err}"}), 500

@app.route('/airlineCode', methods=['POST'])
def get_detailed_itinerary_using_airline_code():
    data = request.get_json()

    airline_code = data.get('airline_code')  # Retrieve the airline_code

    if not airline_code:
        return jsonify({"message": "No airline code provided in the input"}), 400

    cursor = mysql.connection.cursor()

    # Use the WHERE clause to search for routes with the specified airline_code
    query = f"""
    SELECT code_from, code_to, airline_code
    FROM routes
    WHERE airline_code = %s
    """

    cursor.execute(query, (airline_code,))
    routes_data = cursor.fetchall()
    cursor.close()

    if not routes_data:
        # If there are no routes, fetch airline data
        cursor = mysql.connection.cursor()
        cursor.execute("SELECT * FROM airlines WHERE code = %s", (airline_code,))
        airline_data = cursor.fetchone()
        cursor.close()

        if not airline_data:
            return jsonify({"message": "No routes or airline found for the given airline code"}), 404

        # Construct a response with airline data
        airline_dict = {
            "code": airline_data[1],
            "id": airline_data[0],
            "is_lowcost": airline_data[3],
            "logo": airline_data[4],
            "name": airline_data[2]
        }
        return jsonify(airline_dict), 200

    # List to store the results for each route
    result = []

    for route_data in routes_data:
        route_dict = {
            "code_from": route_data[0],
            "code_to": route_data[1],
            "airline_code": route_data[2]
        }

        # Fetch airline details
        cursor = mysql.connection.cursor()
        cursor.execute("SELECT * FROM airlines WHERE code = %s", (airline_code,))
        airline_data = cursor.fetchone()
        cursor.close()

        if airline_data:
            airline_dict = {
                "code": airline_data[1],
                "id": airline_data[0],
                "is_lowcost": airline_data[3],
                "logo": airline_data[4],
                "name": airline_data[2]
            }
            route_dict["airline"] = airline_dict

        # Fetch departure airport details
        cursor = mysql.connection.cursor()
        cursor.execute("SELECT * FROM airports WHERE code = %s", (route_data[0],))
        airport_from_data = cursor.fetchone()
        cursor.close()

        if airport_from_data:
            airport_from_dict = {
                "city": airport_from_data[5],
                "code": airport_from_data[1],
                "country": airport_from_data[7],
                "id": airport_from_data[0],
                "lat": airport_from_data[2],
                "lon": airport_from_data[3],
                "name": airport_from_data[4],
                "state": airport_from_data[6]
            }
            route_dict["Flying_from"] = airport_from_dict

        # Fetch arrival airport details
        cursor = mysql.connection.cursor()
        cursor.execute("SELECT * FROM airports WHERE code = %s", (route_data[1],))
        airport_to_data = cursor.fetchone()
        cursor.close()

        if airport_to_data:
            airport_to_dict = {
                "city": airport_to_data[5],
                "code": airport_to_data[1],
                "country": airport_to_data[7],
                "id": airport_to_data[0],
                "lat": airport_to_data[2],
                "lon": airport_to_data[3],
                "name": airport_to_data[4],
                "state": airport_to_data[6]
            }
            route_dict["Flying_to"] = airport_to_dict

        result.append(route_dict)

        result_sorted = sorted(result, key=lambda x: x.get("Flying_from", {}).get("city", ""))

    return jsonify(result_sorted), 200



if __name__ == '__main__':
    app.run(debug=True)