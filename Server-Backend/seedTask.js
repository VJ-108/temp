// Server-Backend/seedTasks.js
// Run: node seedTasks.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Project } from "./models/project.model.js";

dotenv.config();

const projectTasks = {
	"Calculator App": {
		learningObjectives: [
			"JavaScript Event Handling",
			"DOM Manipulation",
			"CSS Flexbox Layout",
			"Mathematical Operations",
		],
		tasks: [
			{
				id: 1,
				title: "Create HTML Structure",
				description:
					"Build the calculator layout with display screen and button grid for numbers and operations",
				concept: "HTML Structure",
				hints: [
					"Create a container div for the calculator",
					"Add a display div at the top to show calculations",
					"Use a grid layout for organizing number and operation buttons (0-9, +, -, *, /, =, C)",
				],
				resources: [
					{
						title: "MDN: HTML Basics",
						url: "https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML",
					},
				],
			},
			{
				id: 2,
				title: "Style the Calculator UI",
				description:
					"Use CSS Flexbox/Grid to create a clean, modern calculator design",
				concept: "CSS Flexbox Layout",
				hints: [
					"Use CSS Grid to arrange buttons in a 4x4 layout",
					"Style buttons with hover effects and different colors for operations",
					"Make the display area prominent with larger font and background color",
				],
				resources: [
					{
						title: "MDN: CSS Grid",
						url: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout",
					},
				],
			},
			{
				id: 3,
				title: "Select DOM Elements",
				description:
					"Use JavaScript to select all buttons and the display element",
				concept: "DOM Selection",
				hints: [
					"Use document.querySelectorAll() to select all buttons",
					"Use document.querySelector() to select the display element",
					"Store these references in variables for later use",
				],
				resources: [
					{
						title: "MDN: querySelector",
						url: "https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector",
					},
				],
			},
			{
				id: 4,
				title: "Add Click Event Listeners",
				description:
					"Attach event listeners to all buttons to capture user input",
				concept: "Event Handling",
				hints: [
					"Loop through all buttons and add click listeners",
					"Get the button's text content when clicked",
					"Update the display with the clicked value",
				],
				resources: [
					{
						title: "MDN: addEventListener",
						url: "https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener",
					},
				],
			},
			{
				id: 5,
				title: "Build Number Input Logic",
				description:
					"Allow users to input multi-digit numbers by appending digits to display",
				concept: "String Manipulation",
				hints: [
					"When a number is clicked, append it to the current display value",
					"Handle decimal points - only allow one per number",
					"Prevent leading zeros (except for decimals like 0.5)",
				],
				resources: [
					{
						title: "MDN: String Methods",
						url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String",
					},
				],
			},
			{
				id: 6,
				title: "Implement Basic Operations",
				description:
					"Handle +, -, *, / operations using JavaScript's eval() or manual calculation",
				concept: "Mathematical Operations",
				hints: [
					"Store the first number and operation when an operator is clicked",
					"When equals (=) is pressed, perform the calculation",
					"Use eval() carefully or create a custom calculator function",
				],
				resources: [
					{
						title: "MDN: eval()",
						url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval",
					},
				],
			},
			{
				id: 7,
				title: "Add Clear Functionality",
				description: "Implement a Clear (C) button to reset the calculator",
				concept: "State Management",
				hints: [
					"Create a function to reset the display to '0'",
					"Clear any stored numbers and operations",
					"Attach this function to the 'C' button's click event",
				],
				resources: [
					{
						title: "JavaScript Functions",
						url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions",
					},
				],
			},
			{
				id: 8,
				title: "Handle Edge Cases and Errors",
				description:
					"Add error handling for division by zero and invalid operations",
				concept: "Error Handling",
				hints: [
					"Check for division by zero before calculating",
					"Display 'Error' message for invalid operations",
					"Use try-catch to handle unexpected errors",
				],
				resources: [
					{
						title: "MDN: Error Handling",
						url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Control_flow_and_error_handling",
					},
				],
			},
		],
	},

	"To-do App": {
		learningObjectives: [
			"DOM Manipulation",
			"LocalStorage API",
			"Array Methods",
			"Event Handling",
		],
		tasks: [
			{
				id: 1,
				title: "Create HTML Structure",
				description:
					"Build the todo app layout with input field, add button, and list container",
				concept: "HTML Structure",
				hints: [
					"Create an input field for todo text",
					"Add a button to submit new todos",
					"Create an empty ul or div to hold todo items",
				],
				resources: [
					{
						title: "MDN: HTML Forms",
						url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form",
					},
				],
			},
			{
				id: 2,
				title: "Style the Todo UI",
				description: "Add CSS styling to make the todo list visually appealing",
				concept: "CSS Styling",
				hints: [
					"Style todo items with padding, borders, and hover effects",
					"Add strike-through effect for completed todos",
					"Use flexbox to align items and buttons",
				],
				resources: [
					{
						title: "MDN: CSS Basics",
						url: "https://developer.mozilla.org/en-US/docs/Learn/CSS/First_steps",
					},
				],
			},
			{
				id: 3,
				title: "Add New Todos",
				description: "Capture input and create new todo items dynamically",
				concept: "DOM Creation",
				hints: [
					"Get input value when button is clicked",
					"Create a new li element with the todo text",
					"Append it to the todo list container",
				],
				resources: [
					{
						title: "MDN: createElement",
						url: "https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement",
					},
				],
			},
			{
				id: 4,
				title: "Mark Todos as Complete",
				description: "Add click functionality to toggle todo completion status",
				concept: "Event Delegation",
				hints: [
					"Add click listener to each todo item",
					"Toggle a 'completed' CSS class on click",
					"Use classList.toggle() method",
				],
				resources: [
					{
						title: "MDN: classList",
						url: "https://developer.mozilla.org/en-US/docs/Web/API/Element/classList",
					},
				],
			},
			{
				id: 5,
				title: "Delete Todos",
				description: "Add a delete button to each todo for removal",
				concept: "DOM Manipulation",
				hints: [
					"Add a delete button when creating each todo",
					"Use element.remove() to delete the todo",
					"Consider using event delegation for better performance",
				],
				resources: [
					{
						title: "MDN: Element.remove()",
						url: "https://developer.mozilla.org/en-US/docs/Web/API/Element/remove",
					},
				],
			},
			{
				id: 6,
				title: "Save Todos to LocalStorage",
				description:
					"Persist todos in browser storage so they survive page refresh",
				concept: "LocalStorage API",
				hints: [
					"Store todos array in localStorage using JSON.stringify()",
					"Use localStorage.setItem('todos', jsonString)",
					"Update localStorage whenever todos change",
				],
				resources: [
					{
						title: "MDN: localStorage",
						url: "https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage",
					},
				],
			},
			{
				id: 7,
				title: "Load Todos on Page Load",
				description: "Retrieve saved todos from localStorage and display them",
				concept: "Data Persistence",
				hints: [
					"Use localStorage.getItem('todos') on page load",
					"Parse the JSON string with JSON.parse()",
					"Loop through todos and create DOM elements for each",
				],
				resources: [
					{
						title: "MDN: JSON.parse()",
						url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse",
					},
				],
			},
			{
				id: 8,
				title: "Add Edit Functionality",
				description: "Allow users to edit existing todo text",
				concept: "Content Editing",
				hints: [
					"Add an edit button to each todo",
					"Make the todo text editable using contentEditable attribute",
					"Save changes back to localStorage",
				],
				resources: [
					{
						title: "MDN: contentEditable",
						url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/contenteditable",
					},
				],
			},
		],
	},

	"Tic-Tac-Toe Game": {
		learningObjectives: [
			"Game Logic",
			"2D Arrays",
			"Event Handling",
			"Conditional Statements",
		],
		tasks: [
			{
				id: 1,
				title: "Create Game Board HTML",
				description: "Build a 3x3 grid of divs or buttons for the game board",
				concept: "HTML Structure",
				hints: [
					"Create 9 clickable cells arranged in a 3x3 grid",
					"Give each cell a unique data attribute (like data-index='0' to '8')",
					"Add a status display to show whose turn it is",
				],
				resources: [
					{
						title: "MDN: Data Attributes",
						url: "https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes",
					},
				],
			},
			{
				id: 2,
				title: "Style the Game Board",
				description: "Use CSS Grid to create a perfect 3x3 grid layout",
				concept: "CSS Grid",
				hints: [
					"Use display: grid with grid-template-columns: repeat(3, 1fr)",
					"Add borders to cells and hover effects",
					"Style X and O symbols with different colors",
				],
				resources: [
					{
						title: "CSS Grid Guide",
						url: "https://css-tricks.com/snippets/css/complete-guide-grid/",
					},
				],
			},
			{
				id: 3,
				title: "Track Game State",
				description:
					"Create JavaScript variables to track the board state and current player",
				concept: "State Management",
				hints: [
					"Use an array of 9 elements to represent the board (null, 'X', or 'O')",
					"Create a variable to track current player ('X' or 'O')",
					"Create a variable to track if game is over",
				],
				resources: [
					{
						title: "JavaScript Arrays",
						url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array",
					},
				],
			},
			{
				id: 4,
				title: "Handle Cell Clicks",
				description: "Add click listeners to cells and update board on click",
				concept: "Event Handling",
				hints: [
					"Add click listener to each cell",
					"Update the board array with current player's symbol",
					"Display X or O in the clicked cell",
					"Switch player after each turn",
				],
				resources: [
					{
						title: "Event Listeners",
						url: "https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener",
					},
				],
			},
			{
				id: 5,
				title: "Implement Win Detection",
				description: "Check for winning combinations after each move",
				concept: "Game Logic",
				hints: [
					"Define all 8 winning combinations (3 rows, 3 columns, 2 diagonals)",
					"After each move, check if current player matches any winning pattern",
					"Use arrays like [0,1,2], [3,4,5], etc. to represent combinations",
				],
				resources: [
					{
						title: "Array Methods",
						url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array",
					},
				],
			},
			{
				id: 6,
				title: "Detect Draw Condition",
				description: "Check if all cells are filled without a winner",
				concept: "Conditional Logic",
				hints: [
					"After checking for win, count filled cells",
					"If all 9 cells are filled and no winner, declare draw",
					"Use board.every() or board.includes() methods",
				],
				resources: [
					{
						title: "Array.every()",
						url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/every",
					},
				],
			},
			{
				id: 7,
				title: "Display Game Status",
				description: "Show messages for whose turn, winner, or draw",
				concept: "DOM Manipulation",
				hints: [
					"Update status text element after each move",
					"Show 'X's turn' or 'O's turn'",
					"Display 'X wins!', 'O wins!' or 'Draw!' when game ends",
				],
				resources: [
					{
						title: "textContent",
						url: "https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent",
					},
				],
			},
			{
				id: 8,
				title: "Add Reset Functionality",
				description: "Create a reset button to start a new game",
				concept: "State Reset",
				hints: [
					"Clear the board array (set all to null)",
					"Clear all cell displays",
					"Reset current player to 'X'",
					"Reset game over status",
				],
				resources: [
					{
						title: "JavaScript Functions",
						url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions",
					},
				],
			},
		],
	},

	"Quiz App": {
		learningObjectives: [
			"Data Structures",
			"Dynamic Content",
			"Score Tracking",
			"Conditional Rendering",
		],
		tasks: [
			{
				id: 1,
				title: "Create Quiz Data Structure",
				description:
					"Define quiz questions with options and correct answers in JavaScript",
				concept: "JavaScript Objects",
				hints: [
					"Create an array of question objects",
					"Each object should have: question, options array, correctAnswer",
					"Example: {question: '...', options: ['A','B','C','D'], correctAnswer: 0}",
				],
				resources: [
					{
						title: "JavaScript Objects",
						url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_Objects",
					},
				],
			},
			{
				id: 2,
				title: "Build Quiz UI",
				description:
					"Create HTML structure for displaying questions and options",
				concept: "HTML Structure",
				hints: [
					"Create containers for question text and option buttons",
					"Add a 'Next' button to move to next question",
					"Add a container to display score at the end",
				],
				resources: [
					{
						title: "HTML Structure",
						url: "https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML/Document_and_website_structure",
					},
				],
			},
			{
				id: 3,
				title: "Display First Question",
				description:
					"Load and show the first question with options when page loads",
				concept: "DOM Manipulation",
				hints: [
					"Access questions array at index 0",
					"Set question text in the question container",
					"Create button elements for each option and append to DOM",
				],
				resources: [
					{
						title: "createElement",
						url: "https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement",
					},
				],
			},
			{
				id: 4,
				title: "Handle Answer Selection",
				description: "Capture user's selected answer and check if correct",
				concept: "Event Handling",
				hints: [
					"Add click listeners to option buttons",
					"Compare selected option index with correctAnswer",
					"Provide visual feedback (green for correct, red for wrong)",
				],
				resources: [
					{
						title: "Event Listeners",
						url: "https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener",
					},
				],
			},
			{
				id: 5,
				title: "Track Score",
				description: "Keep count of correct answers as user progresses",
				concept: "Score Tracking",
				hints: [
					"Create a score variable initialized to 0",
					"Increment score by 1 when answer is correct",
					"Store score to display at end",
				],
				resources: [
					{
						title: "JavaScript Variables",
						url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types#declarations",
					},
				],
			},
			{
				id: 6,
				title: "Navigate Between Questions",
				description: "Implement 'Next' button to move to subsequent questions",
				concept: "State Management",
				hints: [
					"Track current question index with a variable",
					"Increment index when 'Next' is clicked",
					"Load and display next question using updated index",
				],
				resources: [
					{
						title: "JavaScript Control Flow",
						url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Control_flow_and_error_handling",
					},
				],
			},
			{
				id: 7,
				title: "Show Results",
				description: "Display final score and correct answers when quiz ends",
				concept: "Conditional Rendering",
				hints: [
					"Check if current index equals questions.length",
					"Hide question container and show results container",
					"Display score as 'You scored X out of Y'",
				],
				resources: [
					{
						title: "Conditional Statements",
						url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/if...else",
					},
				],
			},
			{
				id: 8,
				title: "Add Restart Functionality",
				description: "Allow users to retake the quiz",
				concept: "State Reset",
				hints: [
					"Create a 'Restart Quiz' button",
					"Reset score to 0 and question index to 0",
					"Hide results and show first question again",
				],
				resources: [
					{
						title: "Functions",
						url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions",
					},
				],
			},
		],
	},

	"Notes App": {
		learningObjectives: [
			"CRUD Operations",
			"LocalStorage",
			"Search Functionality",
			"Dynamic Lists",
		],
		tasks: [
			{
				id: 1,
				title: "Create Notes Form",
				description: "Build HTML form with inputs for note title and content",
				concept: "HTML Forms",
				hints: [
					"Add input field for note title",
					"Add textarea for note content",
					"Add 'Save Note' button",
				],
				resources: [
					{
						title: "HTML Forms",
						url: "https://developer.mozilla.org/en-US/docs/Learn/Forms",
					},
				],
			},
			{
				id: 2,
				title: "Display Notes List",
				description: "Create a container to display all saved notes",
				concept: "Dynamic Lists",
				hints: [
					"Create an empty div or ul for notes list",
					"Each note should show title and preview of content",
					"Add edit and delete buttons for each note",
				],
				resources: [
					{
						title: "DOM Manipulation",
						url: "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Client-side_web_APIs/Manipulating_documents",
					},
				],
			},
			{
				id: 3,
				title: "Save Notes to LocalStorage",
				description: "Store notes array in browser's localStorage",
				concept: "Data Persistence",
				hints: [
					"Create notes array to hold all notes",
					"Each note object should have: id, title, content, timestamp",
					"Use JSON.stringify() before saving to localStorage",
				],
				resources: [
					{
						title: "LocalStorage",
						url: "https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage",
					},
				],
			},
			{
				id: 4,
				title: "Add New Notes",
				description: "Create function to add new note to the list",
				concept: "CRUD Operations",
				hints: [
					"Get title and content from form",
					"Create note object with unique id (use Date.now())",
					"Add to notes array and save to localStorage",
				],
				resources: [
					{
						title: "Array Methods",
						url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array",
					},
				],
			},
			{
				id: 5,
				title: "Delete Notes",
				description: "Implement delete functionality for removing notes",
				concept: "Array Filtering",
				hints: [
					"Add delete button to each note",
					"Use array.filter() to remove note by id",
					"Update localStorage and re-render list",
				],
				resources: [
					{
						title: "Array.filter()",
						url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter",
					},
				],
			},
			{
				id: 6,
				title: "Edit Existing Notes",
				description: "Allow users to modify note content",
				concept: "Update Operations",
				hints: [
					"Pre-fill form with note data when edit is clicked",
					"Find note in array by id and update its properties",
					"Save updated array to localStorage",
				],
				resources: [
					{
						title: "Array.find()",
						url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find",
					},
				],
			},
			{
				id: 7,
				title: "Implement Search",
				description:
					"Add search functionality to filter notes by title or content",
				concept: "Array Filtering",
				hints: [
					"Add a search input field",
					"Use array.filter() to match search term",
					"Use includes() method for case-insensitive search",
					"Update displayed notes based on search results",
				],
				resources: [
					{
						title: "String.includes()",
						url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes",
					},
				],
			},
			{
				id: 8,
				title: "Load Notes on Page Load",
				description: "Retrieve and display saved notes when page loads",
				concept: "Initialization",
				hints: [
					"Use localStorage.getItem() on page load",
					"Parse JSON string to get notes array",
					"Loop through notes and create DOM elements",
				],
				resources: [
					{
						title: "DOMContentLoaded",
						url: "https://developer.mozilla.org/en-US/docs/Web/API/Document/DOMContentLoaded_event",
					},
				],
			},
		],
	},

	"Weather App": {
		learningObjectives: [
			"API Integration",
			"Async/Await",
			"Error Handling",
			"Dynamic UI Updates",
		],
		tasks: [
			{
				id: 1,
				title: "Setup HTML Structure",
				description:
					"Create input for city name and containers for weather display",
				concept: "HTML Structure",
				hints: [
					"Add input field for city name",
					"Add 'Get Weather' button",
					"Create divs to display temperature, humidity, wind speed, and weather icon",
				],
				resources: [
					{
						title: "HTML Basics",
						url: "https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML",
					},
				],
			},
			{
				id: 2,
				title: "Get API Key",
				description: "Sign up for OpenWeather API and get your API key",
				concept: "API Authentication",
				hints: [
					"Visit openweathermap.org and sign up",
					"Navigate to API keys section",
					"Copy your API key and store it in your JavaScript file",
				],
				resources: [
					{ title: "OpenWeather API", url: "https://openweathermap.org/api" },
				],
			},
			{
				id: 3,
				title: "Make API Request",
				description: "Use fetch() to get weather data from OpenWeather API",
				concept: "Fetch API",
				hints: [
					"Use fetch(`api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`)",
					"Add units=metric parameter for Celsius",
					"Use async/await syntax for cleaner code",
				],
				resources: [
					{
						title: "Fetch API",
						url: "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch",
					},
				],
			},
			{
				id: 4,
				title: "Handle Async Operations",
				description: "Use async/await to handle API response",
				concept: "Async/Await",
				hints: [
					"Mark your function as async",
					"Use await before fetch() call",
					"Use await response.json() to parse data",
				],
				resources: [
					{
						title: "Async/Await",
						url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function",
					},
				],
			},
			{
				id: 5,
				title: "Display Weather Data",
				description: "Extract and show temperature, humidity, and wind speed",
				concept: "Object Destructuring",
				hints: [
					"Access data.main.temp for temperature",
					"Access data.main.humidity for humidity",
					"Access data.wind.speed for wind speed",
					"Update respective DOM elements with this data",
				],
				resources: [
					{
						title: "Destructuring",
						url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment",
					},
				],
			},
			{
				id: 6,
				title: "Show Weather Icons",
				description: "Display weather condition icons based on API response",
				concept: "Dynamic Images",
				hints: [
					"Get icon code from data.weather[0].icon",
					"Construct icon URL: `http://openweathermap.org/img/wn/${icon}@2x.png`",
					"Set img src attribute to this URL",
				],
				resources: [
					{
						title: "Weather Icons",
						url: "https://openweathermap.org/weather-conditions",
					},
				],
			},
			{
				id: 7,
				title: "Handle Errors",
				description:
					"Add error handling for invalid city names or network issues",
				concept: "Error Handling",
				hints: [
					"Wrap fetch in try-catch block",
					"Check response.ok before parsing JSON",
					"Display user-friendly error messages like 'City not found'",
				],
				resources: [
					{
						title: "Try...Catch",
						url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch",
					},
				],
			},
			{
				id: 8,
				title: "Add Loading State",
				description: "Show loading indicator while fetching weather data",
				concept: "UI Feedback",
				hints: [
					"Show 'Loading...' text or spinner before fetch",
					"Hide loading indicator after data is received",
					"Disable button during loading to prevent multiple requests",
				],
				resources: [
					{
						title: "Loading States",
						url: "https://developer.mozilla.org/en-US/docs/Web/API/Element/setAttribute",
					},
				],
			},
		],
	},

	"Portfolio Website": {
		learningObjectives: [
			"Responsive Design",
			"CSS Animations",
			"Smooth Scrolling",
			"Flexbox/Grid",
		],
		tasks: [
			{
				id: 1,
				title: "Create Navigation Bar",
				description:
					"Build a sticky navigation menu with links to different sections",
				concept: "HTML Navigation",
				hints: [
					"Use <nav> tag with links to About, Projects, Skills, Contact sections",
					"Use anchor tags with href='#section-id'",
					"Add CSS position: sticky to keep nav visible on scroll",
				],
				resources: [
					{
						title: "HTML Navigation",
						url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Element/nav",
					},
				],
			},
			{
				id: 2,
				title: "Design Hero Section",
				description:
					"Create an eye-catching hero section with your name and tagline",
				concept: "CSS Flexbox",
				hints: [
					"Use flexbox to center content vertically and horizontally",
					"Add a background image or gradient",
					"Include heading with your name and subtitle with your role",
				],
				resources: [
					{
						title: "CSS Flexbox",
						url: "https://css-tricks.com/snippets/css/a-guide-to-flexbox/",
					},
				],
			},
			{
				id: 3,
				title: "Build About Me Section",
				description: "Add a section with your photo and description",
				concept: "CSS Grid",
				hints: [
					"Use CSS Grid with 2 columns (photo + text)",
					"Add circular profile image",
					"Write a brief description about yourself and skills",
				],
				resources: [
					{
						title: "CSS Grid",
						url: "https://css-tricks.com/snippets/css/complete-guide-grid/",
					},
				],
			},
			{
				id: 4,
				title: "Create Projects Gallery",
				description:
					"Display your projects in a grid with images and descriptions",
				concept: "Card Layout",
				hints: [
					"Use CSS Grid for responsive project cards",
					"Each card should have: project image, title, description, and link",
					"Add hover effects to make cards interactive",
				],
				resources: [
					{
						title: "Card Design",
						url: "https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Flexbox",
					},
				],
			},
			{
				id: 5,
				title: "Add Skills Section",
				description: "List your technical skills with icons or progress bars",
				concept: "Progress Bars",
				hints: [
					"Create progress bars using div elements",
					"Set width based on skill level (e.g., width: 80%)",
					"Add skill names and percentages",
				],
				resources: [
					{
						title: "Progress Bars",
						url: "https://www.w3schools.com/howto/howto_css_skill_bar.asp",
					},
				],
			},
			{
				id: 6,
				title: "Implement Smooth Scrolling",
				description:
					"Add smooth scroll behavior when clicking navigation links",
				concept: "Smooth Scrolling",
				hints: [
					"Add CSS: html { scroll-behavior: smooth; }",
					"Or use JavaScript scrollIntoView({ behavior: 'smooth' })",
					"Test by clicking nav links to see smooth animation",
				],
				resources: [
					{
						title: "Smooth Scrolling",
						url: "https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-behavior",
					},
				],
			},
			{
				id: 7,
				title: "Make It Responsive",
				description: "Use media queries to make portfolio mobile-friendly",
				concept: "Responsive Design",
				hints: [
					"Add @media (max-width: 768px) { } for tablet/mobile",
					"Change grid layouts to single column on small screens",
					"Adjust font sizes and padding for mobile",
				],
				resources: [
					{
						title: "Media Queries",
						url: "https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries",
					},
				],
			},
			{
				id: 8,
				title: "Add Contact Form",
				description:
					"Create a contact form with name, email, and message fields",
				concept: "HTML Forms",
				hints: [
					"Add input fields for name and email",
					"Add textarea for message",
					"Style form with CSS and add a submit button",
				],
				resources: [
					{
						title: "HTML Forms",
						url: "https://developer.mozilla.org/en-US/docs/Learn/Forms",
					},
				],
			},
		],
	},

	"Blog Website": {
		learningObjectives: [
			"Node.js",
			"Express.js",
			"MongoDB",
			"REST API",
			"CRUD Operations",
		],
		tasks: [
			{
				id: 1,
				title: "Setup Express Server",
				description:
					"Initialize Node.js project and create basic Express server",
				concept: "Express.js Setup",
				hints: [
					"Run npm init -y to create package.json",
					"Install express: npm install express",
					"Create server.js and setup basic express app on port 3000",
				],
				resources: [
					{
						title: "Express.js Guide",
						url: "https://expressjs.com/en/starter/hello-world.html",
					},
				],
			},
			{
				id: 2,
				title: "Connect to MongoDB",
				description: "Setup MongoDB connection using Mongoose",
				concept: "Database Connection",
				hints: [
					"Install mongoose: npm install mongoose",
					"Use mongoose.connect() with your MongoDB URI",
					"Handle connection success and error events",
				],
				resources: [
					{
						title: "Mongoose Guide",
						url: "https://mongoosejs.com/docs/guide.html",
					},
				],
			},
			{
				id: 3,
				title: "Create Blog Schema",
				description: "Define MongoDB schema for blog posts",
				concept: "Data Modeling",
				hints: [
					"Create Post model with fields: title, content, author, tags, createdAt",
					"Use mongoose.Schema to define structure",
					"Export model using mongoose.model('Post', postSchema)",
				],
				resources: [
					{
						title: "Mongoose Schemas",
						url: "https://mongoosejs.com/docs/guide.html",
					},
				],
			},
			{
				id: 7,
				title: "Display Course Dashboard",
				description: "Create UI showing enrolled courses and progress",
				concept: "Frontend Display",
				hints: [
					"Fetch enrolled courses from API",
					"Display course cards with progress bars",
					"Show percentage completion for each course",
				],
				resources: [
					{
						title: "Fetch API",
						url: "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API",
					},
				],
			},
			{
				id: 8,
				title: "Add Certificate Generation",
				description: "Generate completion certificate for finished courses",
				concept: "Dynamic Content",
				hints: [
					"When progress reaches 100%, mark as completed",
					"Generate certificate with student name, course name, date",
					"Use HTML/CSS to create certificate template",
				],
				resources: [
					{
						title: "HTML Canvas",
						url: "https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API",
					},
				],
			},
		],
	},

	"Expense Tracker": {
		learningObjectives: [
			"Array Methods",
			"Charts.js",
			"Data Visualization",
			"LocalStorage",
		],
		tasks: [
			{
				id: 1,
				title: "Create Expense Form",
				description:
					"Build form to add income/expense with description, amount, and category",
				concept: "HTML Forms",
				hints: [
					"Add input for description/title",
					"Add input type='number' for amount",
					"Add select dropdown for categories (Food, Transport, Entertainment, etc.)",
					"Add radio buttons to choose Income or Expense",
				],
				resources: [
					{
						title: "HTML Forms",
						url: "https://developer.mozilla.org/en-US/docs/Learn/Forms",
					},
				],
			},
			{
				id: 2,
				title: "Store Transactions",
				description: "Save transactions in an array and localStorage",
				concept: "Data Storage",
				hints: [
					"Create transactions array",
					"Each transaction: {id, description, amount, category, type, date}",
					"Save to localStorage after each addition",
				],
				resources: [
					{
						title: "LocalStorage",
						url: "https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage",
					},
				],
			},
			{
				id: 3,
				title: "Display Transaction List",
				description: "Show all transactions in a list with details",
				concept: "Dynamic Lists",
				hints: [
					"Loop through transactions array",
					"Create DOM elements for each transaction",
					"Show different colors for income (green) and expense (red)",
				],
				resources: [
					{
						title: "DOM Manipulation",
						url: "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Client-side_web_APIs/Manipulating_documents",
					},
				],
			},
			{
				id: 4,
				title: "Calculate Balance",
				description: "Calculate and display total income, expense, and balance",
				concept: "Array Methods",
				hints: [
					"Use array.filter() to separate income and expenses",
					"Use array.reduce() to sum amounts",
					"Balance = Total Income - Total Expenses",
				],
				resources: [
					{
						title: "Array.reduce()",
						url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce",
					},
				],
			},
			{
				id: 5,
				title: "Delete Transactions",
				description: "Add delete button to remove transactions",
				concept: "Array Filtering",
				hints: [
					"Add delete button to each transaction",
					"Use array.filter() to remove by id",
					"Update localStorage and recalculate balance",
				],
				resources: [
					{
						title: "Array.filter()",
						url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter",
					},
				],
			},
			{
				id: 6,
				title: "Setup Chart.js",
				description: "Include Chart.js library for data visualization",
				concept: "Library Integration",
				hints: [
					"Add Chart.js CDN to HTML: <script src='https://cdn.jsdelivr.net/npm/chart.js'></script>",
					"Create canvas element for chart",
					"Initialize Chart.js instance",
				],
				resources: [
					{
						title: "Chart.js Docs",
						url: "https://www.chartjs.org/docs/latest/",
					},
				],
			},
			{
				id: 7,
				title: "Create Pie Chart",
				description: "Visualize expense categories in a pie chart",
				concept: "Data Visualization",
				hints: [
					"Group expenses by category using array.reduce()",
					"Create pie chart with Chart.js",
					"Pass category names as labels and amounts as data",
				],
				resources: [
					{
						title: "Chart.js Pie Chart",
						url: "https://www.chartjs.org/docs/latest/charts/doughnut.html",
					},
				],
			},
			{
				id: 8,
				title: "Add Monthly Summary",
				description: "Show income/expense trend over months in a bar chart",
				concept: "Time-Based Data",
				hints: [
					"Filter transactions by month",
					"Calculate monthly totals",
					"Create bar chart showing income vs expense per month",
				],
				resources: [
					{
						title: "Chart.js Bar Chart",
						url: "https://www.chartjs.org/docs/latest/charts/bar.html",
					},
				],
			},
		],
	},

	"Movie Search App": {
		learningObjectives: [
			"API Integration",
			"Search Functionality",
			"Dynamic Content",
			"LocalStorage",
		],
		tasks: [
			{
				id: 1,
				title: "Setup HTML Structure",
				description: "Create search input and container for movie results",
				concept: "HTML Structure",
				hints: [
					"Add search input and button",
					"Create div to display movie cards",
					"Add section for bookmarked movies",
				],
				resources: [
					{
						title: "HTML Basics",
						url: "https://developer.mozilla.org/en-US/docs/Learn/HTML",
					},
				],
			},
			{
				id: 2,
				title: "Get OMDb API Key",
				description: "Sign up for OMDb API and obtain API key",
				concept: "API Authentication",
				hints: [
					"Visit omdbapi.com and request free API key",
					"Store API key in your JavaScript file",
					"Test API with: http://www.omdbapi.com/?apikey=YOUR_KEY&s=batman",
				],
				resources: [{ title: "OMDb API", url: "https://www.omdbapi.com/" }],
			},
			{
				id: 3,
				title: "Fetch Movie Data",
				description: "Use fetch() to search movies from OMDb API",
				concept: "Fetch API",
				hints: [
					"Use endpoint: `http://www.omdbapi.com/?apikey=${key}&s=${searchTerm}`",
					"Use async/await for cleaner code",
					"Parse response with response.json()",
				],
				resources: [
					{
						title: "Fetch API",
						url: "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch",
					},
				],
			},
			{
				id: 4,
				title: "Display Movie Cards",
				description: "Show movie results with poster, title, year, and rating",
				concept: "Dynamic Content",
				hints: [
					"Loop through API response data.Search array",
					"Create card element for each movie",
					"Display poster, title, year, and type",
				],
				resources: [
					{
						title: "DOM Manipulation",
						url: "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Client-side_web_APIs/Manipulating_documents",
					},
				],
			},
			{
				id: 5,
				title: "Fetch Movie Details",
				description: "Get detailed info for a movie when card is clicked",
				concept: "API Queries",
				hints: [
					"Use endpoint: `http://www.omdbapi.com/?apikey=${key}&i=${imdbID}`",
					"Show plot, director, actors in a modal or expanded view",
					"Display ratings from different sources",
				],
				resources: [
					{ title: "OMDb API Docs", url: "https://www.omdbapi.com/" },
				],
			},
			{
				id: 6,
				title: "Add Bookmark Feature",
				description: "Allow users to save favorite movies",
				concept: "LocalStorage",
				hints: [
					"Add bookmark button to each movie card",
					"Store bookmarked movies in localStorage as array",
					"Show bookmarked movies in separate section",
				],
				resources: [
					{
						title: "LocalStorage",
						url: "https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage",
					},
				],
			},
			{
				id: 7,
				title: "Remove Bookmarks",
				description: "Add functionality to remove movies from bookmarks",
				concept: "Array Filtering",
				hints: [
					"Add remove button to bookmarked movies",
					"Use array.filter() to remove by movie ID",
					"Update localStorage after removal",
				],
				resources: [
					{
						title: "Array.filter()",
						url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter",
					},
				],
			},
			{
				id: 8,
				title: "Handle Search Errors",
				description: "Show user-friendly messages for no results or errors",
				concept: "Error Handling",
				hints: [
					"Check if data.Response === 'False' in API response",
					"Display 'No movies found' message",
					"Handle network errors with try-catch",
				],
				resources: [
					{
						title: "Error Handling",
						url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Control_flow_and_error_handling",
					},
				],
			},
		],
	},

	"MERN Authentication App": {
		learningObjectives: [
			"JWT Authentication",
			"Express.js",
			"MongoDB",
			"Bcrypt",
			"Protected Routes",
		],
		tasks: [
			{
				id: 1,
				title: "Setup Express Server",
				description: "Initialize Node.js project with Express",
				concept: "Server Setup",
				hints: [
					"Run npm init -y",
					"Install: express, mongoose, bcryptjs, jsonwebtoken, dotenv",
					"Create server.js and setup express app",
				],
				resources: [
					{
						title: "Express Setup",
						url: "https://expressjs.com/en/starter/installing.html",
					},
				],
			},
			{
				id: 2,
				title: "Create User Schema",
				description: "Define User model with email and password",
				concept: "Data Modeling",
				hints: [
					"Create User schema with: email (unique), password, name",
					"Add timestamps for createdAt and updatedAt",
					"Export User model",
				],
				resources: [
					{
						title: "Mongoose Models",
						url: "https://mongoosejs.com/docs/models.html",
					},
				],
			},
			{
				id: 3,
				title: "Hash Passwords",
				description: "Use bcrypt to hash passwords before saving",
				concept: "Password Security",
				hints: [
					"Import bcryptjs",
					"Use bcrypt.hash(password, 10) before saving user",
					"Never store plain text passwords",
				],
				resources: [
					{ title: "Bcrypt.js", url: "https://www.npmjs.com/package/bcryptjs" },
				],
			},
			{
				id: 4,
				title: "Build Signup Route",
				description: "Create POST /signup endpoint to register users",
				concept: "User Registration",
				hints: [
					"Check if user already exists",
					"Hash password with bcrypt",
					"Save new user to database",
				],
				resources: [
					{
						title: "Express Routing",
						url: "https://expressjs.com/en/guide/routing.html",
					},
				],
			},
			{
				id: 5,
				title: "Build Login Route",
				description: "Create POST /login endpoint with JWT generation",
				concept: "Authentication",
				hints: [
					"Find user by email",
					"Compare password using bcrypt.compare()",
					"Generate JWT token with jsonwebtoken.sign()",
				],
				resources: [
					{ title: "JWT", url: "https://www.npmjs.com/package/jsonwebtoken" },
				],
			},
			{
				id: 6,
				title: "Create Auth Middleware",
				description: "Build middleware to verify JWT tokens",
				concept: "Middleware",
				hints: [
					"Extract token from Authorization header",
					"Verify token with jwt.verify()",
					"Attach user data to req.user if valid",
				],
				resources: [
					{
						title: "Express Middleware",
						url: "https://expressjs.com/en/guide/using-middleware.html",
					},
				],
			},
			{
				id: 7,
				title: "Create Protected Route",
				description: "Build route that requires authentication",
				concept: "Protected Routes",
				hints: [
					"Create GET /profile route",
					"Use auth middleware before route handler",
					"Return user data from req.user",
				],
				resources: [
					{
						title: "Route Protection",
						url: "https://expressjs.com/en/guide/routing.html",
					},
				],
			},
			{
				id: 8,
				title: "Build Frontend Pages",
				description: "Create HTML pages for signup, login, and profile",
				concept: "Frontend Integration",
				hints: [
					"Create signup.html with registration form",
					"Create login.html with login form",
					"Store JWT token in localStorage after login",
					"Send token in Authorization header for protected requests",
				],
				resources: [
					{
						title: "Fetch with Headers",
						url: "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch",
					},
				],
			},
		],
	},

	"E-commerce Platform": {
		learningObjectives: [
			"Full Stack Development",
			"Shopping Cart Logic",
			"Payment Integration",
			"Admin Panel",
		],
		tasks: [
			{
				id: 1,
				title: "Setup Project Structure",
				description:
					"Initialize MERN stack project with frontend and backend folders",
				concept: "Project Organization",
				hints: [
					"Create separate folders: client (frontend) and server (backend)",
					"Install Express, Mongoose, bcryptjs, JWT in server",
					"Setup basic Express server",
				],
				resources: [
					{
						title: "Project Structure",
						url: "https://expressjs.com/en/starter/hello-world.html",
					},
				],
			},
			{
				id: 2,
				title: "Create Product Schema",
				description: "Define MongoDB schema for products",
				concept: "Data Modeling",
				hints: [
					"Fields: name, description, price, image, category, stock",
					"Add timestamps",
					"Create Product model",
				],
				resources: [
					{
						title: "Mongoose Schemas",
						url: "https://mongoosejs.com/docs/guide.html",
					},
				],
			},
			{
				id: 3,
				title: "Build Product APIs",
				description: "Create CRUD endpoints for products",
				concept: "REST API",
				hints: [
					"GET /api/products - list all",
					"GET /api/products/:id - single product",
					"POST /api/products - add product (admin only)",
					"PUT /api/products/:id - update (admin only)",
					"DELETE /api/products/:id - remove (admin only)",
				],
				resources: [
					{
						title: "Express REST API",
						url: "https://expressjs.com/en/guide/routing.html",
					},
				],
			},
			{
				id: 4,
				title: "Create Product Listing Page",
				description: "Display all products with images and prices",
				concept: "Frontend Display",
				hints: [
					"Fetch products from API",
					"Create product cards with image, name, price",
					"Add 'Add to Cart' button on each card",
				],
				resources: [
					{
						title: "Fetch API",
						url: "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API",
					},
				],
			},
			{
				id: 5,
				title: "Implement Shopping Cart",
				description: "Build cart functionality with add/remove/update quantity",
				concept: "State Management",
				hints: [
					"Store cart in localStorage as array of {productId, quantity}",
					"Calculate total price",
					"Update cart on add/remove",
				],
				resources: [
					{
						title: "LocalStorage",
						url: "https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage",
					},
				],
			},
			{
				id: 6,
				title: "Create Cart Page",
				description: "Display cart items with quantity controls and total",
				concept: "Cart UI",
				hints: [
					"Show product name, price, quantity, subtotal for each item",
					"Add +/- buttons to change quantity",
					"Show grand total at bottom",
					"Add 'Proceed to Checkout' button",
				],
				resources: [
					{
						title: "DOM Manipulation",
						url: "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Client-side_web_APIs/Manipulating_documents",
					},
				],
			},
			{
				id: 7,
				title: "Build Admin Panel",
				description: "Create admin interface to manage products",
				concept: "Admin Features",
				hints: [
					"Add isAdmin field to User schema",
					"Create protected admin routes",
					"Build UI to add/edit/delete products",
				],
				resources: [
					{
						title: "Role-Based Access",
						url: "https://expressjs.com/en/guide/using-middleware.html",
					},
				],
			},
			{
				id: 8,
				title: "Simulate Checkout",
				description: "Create checkout flow (without real payment)",
				concept: "Order Processing",
				hints: [
					"Create Order schema with: user, products, totalAmount, status",
					"POST /api/orders endpoint to create order",
					"Show order confirmation page",
					"Note: For real payments, integrate Stripe later",
				],
				resources: [
					{
						title: "Order Management",
						url: "https://mongoosejs.com/docs/models.html",
					},
				],
			},
		],
	},

	"Chat Application": {
		learningObjectives: [
			"Socket.io",
			"Real-time Communication",
			"WebSockets",
			"Event Handling",
		],
		tasks: [
			{
				id: 1,
				title: "Setup Express Server",
				description: "Initialize Node.js project with Express and Socket.io",
				concept: "Server Setup",
				hints: [
					"npm install express socket.io",
					"Create server with http.createServer(app)",
					"Initialize Socket.io: io = require('socket.io')(server)",
				],
				resources: [
					{
						title: "Socket.io Docs",
						url: "https://socket.io/get-started/chat",
					},
				],
			},
			{
				id: 2,
				title: "Create Chat UI",
				description: "Build HTML interface with message area and input",
				concept: "HTML Structure",
				hints: [
					"Create div for displaying messages",
					"Add input field and send button",
					"Style with CSS to look like chat interface",
				],
				resources: [
					{
						title: "HTML Basics",
						url: "https://developer.mozilla.org/en-US/docs/Learn/HTML",
					},
				],
			},
			{
				id: 3,
				title: "Connect Client to Socket",
				description: "Establish WebSocket connection from client",
				concept: "Socket Connection",
				hints: [
					"Include socket.io client: <script src='/socket.io/socket.io.js'></script>",
					"Connect with: const socket = io()",
					"Listen for 'connect' event",
				],
				resources: [
					{
						title: "Socket.io Client",
						url: "https://socket.io/docs/v4/client-api/",
					},
				],
			},
			{
				id: 4,
				title: "Send Messages",
				description: "Emit message events from client to server",
				concept: "Event Emitters",
				hints: [
					"Get message from input on button click",
					"Emit with: socket.emit('chat message', message)",
					"Clear input after sending",
				],
				resources: [
					{
						title: "Emitting Events",
						url: "https://socket.io/docs/v4/emitting-events/",
					},
				],
			},
			{
				id: 5,
				title: "Broadcast Messages",
				description: "Receive and broadcast messages to all clients",
				concept: "Broadcasting",
				hints: [
					"On server: socket.on('chat message', (msg) => {})",
					"Broadcast to all: io.emit('chat message', msg)",
					"Or exclude sender: socket.broadcast.emit()",
				],
				resources: [
					{
						title: "Broadcasting",
						url: "https://socket.io/docs/v4/broadcasting-events/",
					},
				],
			},
			{
				id: 6,
				title: "Display Received Messages",
				description: "Listen for messages and display them",
				concept: "DOM Updates",
				hints: [
					"socket.on('chat message', (msg) => {})",
					"Create message element and append to chat",
					"Auto-scroll to latest message",
				],
				resources: [
					{
						title: "DOM Manipulation",
						url: "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Client-side_web_APIs/Manipulating_documents",
					},
				],
			},
			{
				id: 7,
				title: "Show Online Users",
				description: "Display count of connected users",
				concept: "Connection Tracking",
				hints: [
					"Track connections on server with counter",
					"On 'connection': increment, emit user count",
					"On 'disconnect': decrement, emit update",
				],
				resources: [
					{
						title: "Connection Events",
						url: "https://socket.io/docs/v4/server-socket-instance/",
					},
				],
			},
			{
				id: 8,
				title: "Add Typing Indicator",
				description: "Show when someone is typing",
				concept: "Real-time Indicators",
				hints: [
					"Emit 'typing' event on input change",
					"Broadcast typing event to others",
					"Display 'User is typing...' message",
					"Clear after 2 seconds of no input",
				],
				resources: [
					{
						title: "Socket Events",
						url: "https://socket.io/docs/v4/emitting-events/",
					},
				],
			},
		],
	},
	"Learning Management System (LMS)": {
		learningObjectives: [
			"Role-Based Access",
			"File Upload",
			"Progress Tracking",
			"Complex Schemas",
		],
		tasks: [
			{
				id: 1,
				title: "Setup Project Structure",
				description: "Initialize MERN project with authentication",
				concept: "Project Setup",
				hints: [
					"Setup Express server with MongoDB",
					"Install: express, mongoose, bcryptjs, jsonwebtoken, multer",
					"Create folder structure: models, routes, controllers",
				],
				resources: [
					{
						title: "Express Setup",
						url: "https://expressjs.com/en/starter/installing.html",
					},
				],
			},
			{
				id: 2,
				title: "Create User Roles",
				description:
					"Define User schema with role field (student/instructor/admin)",
				concept: "Role-Based Access",
				hints: [
					"Add role field to User schema with enum: ['student', 'instructor', 'admin']",
					"Default role should be 'student'",
					"Create middleware to check user role",
				],
				resources: [
					{
						title: "Mongoose Enums",
						url: "https://mongoosejs.com/docs/schematypes.html#strings",
					},
				],
			},
			{
				id: 3,
				title: "Create Course Schema",
				description:
					"Define Course model with title, description, instructor, lessons",
				concept: "Complex Schemas",
				hints: [
					"Fields: title, description, instructor (ref to User), lessons array",
					"Lessons: {title, content, videoUrl, order}",
					"Add enrolledStudents array referencing Users",
				],
				resources: [
					{
						title: "Mongoose Population",
						url: "https://mongoosejs.com/docs/populate.html",
					},
				],
			},
			{
				id: 4,
				title: "Build Course Creation",
				description: "Allow instructors to create courses",
				concept: "CRUD Operations",
				hints: [
					"POST /api/courses - create course (instructor only)",
					"Check req.user.role === 'instructor'",
					"Save course with instructor ID",
				],
				resources: [
					{
						title: "Express POST",
						url: "https://expressjs.com/en/guide/routing.html",
					},
				],
			},
			{
				id: 5,
				title: "Implement Course Enrollment",
				description: "Allow students to enroll in courses",
				concept: "Array Operations",
				hints: [
					"POST /api/courses/:id/enroll",
					"Add student ID to course's enrolledStudents array",
					"Use $addToSet to prevent duplicates",
				],
				resources: [
					{
						title: "MongoDB $addToSet",
						url: "https://docs.mongodb.com/manual/reference/operator/update/addToSet/",
					},
				],
			},
			{
				id: 6,
				title: "Track Student Progress",
				description: "Create Progress schema to track completed lessons",
				concept: "Progress Tracking",
				hints: [
					"Create Progress schema: {student, course, completedLessons[], percentage}",
					"Update when student marks lesson complete",
					"Calculate percentage: (completed / total) * 100",
				],
				resources: [
					{
						title: "Mongoose Schemas",
						url: "https://mongoosejs.com/docs/guide.html",
					},
				],
			},
			{
				id: 7,
				title: "Display Course Dashboard",
				description: "Create UI showing enrolled courses and progress",
				concept: "Frontend Display",
				hints: [
					"Fetch enrolled courses from API",
					"Display course cards with progress bars",
					"Show percentage completion for each course",
				],
				resources: [
					{
						title: "Fetch API",
						url: "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API",
					},
				],
			},
			{
				id: 8,
				title: "Add Certificate Generation",
				description: "Generate completion certificate for finished courses",
				concept: "Dynamic Content",
				hints: [
					"When progress reaches 100%, mark as completed",
					"Generate certificate with student name, course name, date",
					"Use HTML/CSS to create certificate template",
				],
				resources: [
					{
						title: "HTML Canvas",
						url: "https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API",
					},
				],
			},
		],
	},

	"AI Image Generator": {
		learningObjectives: [
			"API Integration",
			"File Handling",
			"Async Operations",
			"Image Processing",
		],
		tasks: [
			{
				id: 1,
				title: "Setup Backend Server",
				description: "Initialize Express server for API proxy",
				concept: "Server Setup",
				hints: [
					"npm install express axios dotenv",
					"Create server.js with Express app",
					"Setup CORS for frontend communication",
				],
				resources: [
					{
						title: "Express Setup",
						url: "https://expressjs.com/en/starter/installing.html",
					},
				],
			},
			{
				id: 2,
				title: "Get OpenAI API Key",
				description: "Sign up for OpenAI and obtain API key",
				concept: "API Authentication",
				hints: [
					"Visit platform.openai.com and sign up",
					"Navigate to API keys section",
					"Store key in .env file: OPENAI_API_KEY=your_key",
				],
				resources: [
					{
						title: "OpenAI API",
						url: "https://platform.openai.com/docs/api-reference",
					},
				],
			},
			{
				id: 3,
				title: "Create Prompt Input UI",
				description: "Build frontend with text input for image prompts",
				concept: "HTML Forms",
				hints: [
					"Add textarea for detailed prompt input",
					"Add 'Generate Image' button",
					"Create container to display generated image",
				],
				resources: [
					{
						title: "HTML Forms",
						url: "https://developer.mozilla.org/en-US/docs/Learn/Forms",
					},
				],
			},
			{
				id: 4,
				title: "Call DALL-E API",
				description: "Make API request to generate image from prompt",
				concept: "API Integration",
				hints: [
					"Use axios.post() to OpenAI DALL-E endpoint",
					"Send prompt in request body",
					"Handle response which contains image URL",
				],
				resources: [
					{
						title: "Axios POST",
						url: "https://axios-http.com/docs/post_example",
					},
				],
			},
			{
				id: 5,
				title: "Display Generated Image",
				description: "Show AI-generated image on the page",
				concept: "DOM Manipulation",
				hints: [
					"Get image URL from API response",
					"Create img element or update existing one",
					"Set src attribute to the returned URL",
				],
				resources: [
					{
						title: "Image Element",
						url: "https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement",
					},
				],
			},
			{
				id: 6,
				title: "Add Loading State",
				description: "Show loading spinner while image generates",
				concept: "UI Feedback",
				hints: [
					"Display 'Generating...' text or spinner before API call",
					"Hide loading state when image is received",
					"Disable button during generation",
				],
				resources: [
					{
						title: "Loading Indicators",
						url: "https://developer.mozilla.org/en-US/docs/Web/CSS/animation",
					},
				],
			},
			{
				id: 7,
				title: "Implement Download Feature",
				description: "Allow users to download generated images",
				concept: "File Download",
				hints: [
					"Create download button below image",
					"Use <a> tag with download attribute",
					"Set href to image URL",
				],
				resources: [
					{
						title: "Download Attribute",
						url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#attr-download",
					},
				],
			},
			{
				id: 8,
				title: "Save to User Gallery",
				description: "Store generated images in user's profile",
				concept: "Data Persistence",
				hints: [
					"Create Image schema: {userId, prompt, imageUrl, createdAt}",
					"Save image data after generation",
					"Display user's image history in a gallery view",
				],
				resources: [
					{
						title: "Mongoose Models",
						url: "https://mongoosejs.com/docs/models.html",
					},
				],
			},
		],
	},
};

async function seedProjects() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    let updatedCount = 0;

    for (const [projectTitle, taskData] of Object.entries(projectTasks)) {
      const project = await Project.findOne({ 
        title: { $regex: new RegExp(projectTitle, 'i') } 
      });

      if (project) {
        project.learningObjectives = taskData.learningObjectives;
        project.tasks = taskData.tasks;
        await project.save();
        console.log(`✅ Updated "${projectTitle}" with ${taskData.tasks.length} tasks`);
        updatedCount++;
      } else {
        console.log(`⚠️  Project "${projectTitle}" not found in database`);
      }
    }

    console.log(`\n🎉 Successfully updated ${updatedCount} projects with tasks!`);
    console.log("\n📊 Summary:");
    console.log(`- Total projects with tasks: ${updatedCount}`);
    console.log(`- Average tasks per project: ${Math.round(Object.values(projectTasks).reduce((sum, p) => sum + p.tasks.length, 0) / updatedCount)}`);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding projects:", error);
    process.exit(1);
  }
}

seedProjects()