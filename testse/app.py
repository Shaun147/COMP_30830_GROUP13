import flask

app = flask.Flask(__name__)
@app.route("/")
def hello():
    # return "hello"
    return flask.render_template("index1.html")

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=3306)