#React Crash Course: Fundamentals and Component-Based Architecture

## Overview
This React crash course by Mohammad Ani provides a comprehensive introduction to React, covering fundamental concepts, development environment setup, component creation, state management, event handling, and component composition. The course builds a shopping cart-like application throughout to demonstrate React concepts in practice. Key topics include JSX syntax, virtual DOM, component lifecycle, props vs state, event handling, and techniques for sharing data between components through state lifting. The instructor emphasizes React's component-based architecture where UIs are built from independent, isolated, reusable components that are composed together to create complex interfaces.

## Key Concepts
- **React Library**: JavaScript library (not framework) for building fast, interactive user interfaces developed at Facebook in 2011; focuses only on view layer
- **Component-Based Architecture**: UIs built from independent, isolated, reusable components that are composed together forming a component tree
- **Virtual DOM**: Lightweight in-memory representation of real DOM that React uses to optimize updates by comparing changes and updating only what's necessary
- **JSX**: JavaScript XML syntax allowing HTML-like code in JavaScript; gets compiled to React.createElement calls
- **State and Props**: State is local/component-specific data that can change (managed with setState); props are read-only data passed from parent components
- **Event Handling**: Using camelCase event names (onClick, etc.) and updating state with setState(); this binding considerations in event handlers
- **Component Composition**: Building complex UIs by nesting components within each other (parent-child relationships)
- **State Lifting**: Moving state to parent components when multiple child components need to share data
- **Lifecycle Hooks**: Special methods that run at different points in a component's life (mounting, updating, unmounting)
- **Controlled Components**: Components that get their data via props and communicate changes via events rather than managing local state
- **Functional Components**: Simpler components defined as functions that return JSX, especially useful for stateless components

## Step-by-Step Explanation

### 1. Introduction to React
React is a JavaScript library focused on rendering views and keeping them in sync with state, unlike Angular which is a complete framework. At its core are components - pieces of UI that can be built in isolation and composed together. Every React app has a root component containing child components forming a tree. Components have state (data to display) and a render method (describing UI). The render method returns a React element (plain JavaScript object), not a real DOM element. React maintains a Virtual DOM - lightweight in-memory UI representation. When state changes, React creates new element, compares with previous, and updates only changed parts of real DOM, eliminating manual DOM manipulation.

### 2. Setting Up Development Environment
- Install Node.js (includes NPM)
- Install create-react-app globally: `npm i -g create-react-app@1.5.2` (specific version for course consistency)
- Use VS Code as code editor- Install extensions:
  - Simple React Snippets (by Burke Holland) for React code shortcuts  - Prettier - Code formatter (by Peterson) for automatic code formatting
- Enable "editor.formatOnSave" in VS Code settings for automatic formatting on save
- Choose preferred color theme (instructor uses "Dark+" theme)

### 3. Creating First React App
- Create app: `create-react-app react-app`
- Navigate and start: `cd react-app && npm start`
- Project structure:
  - node_modules: Third-party libraries (don't modify)
  - public: Static assets (index.html contains `<div id="root"></div>` as container)
  - src: Application source code
- Default app shows black banner from App component

### 4. Building from Scratch
- Delete all files in src folder
- Create index.js:
  ```javascript
  import React from 'react';
  import ReactDOM from 'react-dom';
  
  const element = <h1>Hello World</h1>;
  
  ReactDOM.render(element, document.getElementById('root'));
  ```
- JSX `<h1>Hello World</h1>` compiles to `React.createElement('h1', null, 'Hello World')`
- Must import React even when not directly used because compiled code references it
- ReactDOM.render() takes element and DOM container to render into

### 5. Creating Components
- Create components folder and counter.js file
- Basic component structure:
  ```javascript
  import React, { Component } from 'react';
  
  class Counter extends Component {
    render() {
      return (
        <div>
          <h1>Hello World</h1>
          <button>Increment</button>
        </div>
      );
    }
  }
  
  export default Counter;
  ```
- In index.js: Import and use component:
  ```javascript
  import Counter from './components/Counter';
  
  ReactDOM.render(<Counter />, document.getElementById('root'));
  ```
- JSX requires single parent element - wrap multiple elements in div or use React.Fragment
- To avoid extra div: Use `<React.Fragment>...</React.Fragment>` or shorthand `<>...</>`

### 6. State and Dynamic Rendering
- Add state to component:
  ```javascript
  class Counter extends Component {
    state = {
      count: 0
    };
    
    render() {
      return (
        <div>
          <span>{this.state.count}</span>
          <button>Increment</button>
        </div>
      );
    }
  }
  ```
- Render dynamic values using curly braces: `{this.state.count}`
- Use object destructuring to simplify: `const { count } = this.state;`
- Format values with helper methods:
  ```javascript
  formatCount() {
    const { count } = this.state;
    return count === 0 ? 'Zero' : count;
  }
  ```
- Then use in JSX: `<span>{this.formatCount()}</span>`

### 7. Working with Attributes and Styles
- Set attributes dynamically:
  ```javascript  state = {
    imageUrl: 'https://source.unsplash.com/random/200x200'
  };
  
  <img src={this.state.imageUrl} alt="Random" />
  ```
- Class attribute becomes className in JSX (due to JavaScript reserved word):
  ```javascript
  <span className="badge badge-primary m-2">{this.state.count}</span>
  ```
- Apply conditional classes:
  ```javascript
  getBadgeClasses() {
    let classes = "badge m-2 ";
    classes += this.state.count === 0 ? "badge-warning" : "badge-primary";
    return classes;
  }
  ```
  Then use: `<span className={this.getBadgeClasses()}>{this.state.count}</span>`
- Inline styles with JavaScript object:
  ```javascript
  const styles = {
    fontSize: 14,
    fontWeight: 'bold'
  };
    <span style={styles}>{this.state.count}</span>;
  ```
  Or inline: `<span style={{ fontSize: 14, fontWeight: 'bold' }}>{this.state.count}</span>`

### 8. Event Handling
- Handle click events:
  ```javascript
  handleIncrement() {
    console.log('Increment clicked');
  }
  
  <button onClick={this.handleIncrement}>Increment</button>
  ```
- Problem: `this` is undefined in event handler (due to how JavaScript binds this)
- Solutions:
  1. Bind in constructor:
     ```javascript
     constructor() {
       super();
       this.handleIncrement = this.handleIncrement.bind(this);
     }
     ```
  2. Use arrow function (automatically binds this):
     ```javascript
     handleIncrement = () => {
       console.log('Increment clicked');
     };
     ```
- Update state with setState (never modify state directly):
  ```javascript
  handleIncrement = () => {
    this.setState({ count: this.state.count + 1 });
  };
  ```
- setState is asynchronous - React may batch multiple updates
- When updating state based on previous state, use functional form:
  ```javascript
  this.setState((prevState) => ({
    count: prevState.count + 1
  }));
  ```

### 9. Rendering Lists
- Map arrays to JSX elements:
  ```javascript  state = {
    tags: ['tag1', 'tag2', 'tag3']
  };
  
  render() {
    return (
      <ul>
        {this.state.tags.map(tag => (
          <li key={tag}>{tag}</li>
        ))}
      </ul>
    );
  }
  ```
- Key prop required for list items to help React identify which items changed
- Key should be unique among siblings but doesn't need to be globally unique
- Conditional rendering:
  ```javascript
  renderTags() {
    if (this.state.tags.length === 0) {
      return <p>No tags</p>;
    }
    return (
      <ul>
        {this.state.tags.map(tag => (
          <li key={tag}>{tag}</li>
        ))}
      </ul>
    );
  }
  
  render() {
    return (
      <div>
        {this.renderTags()}
      </div>
    );
  }
  ```
- Alternative conditional rendering with logical AND:
  ```javascript
  {this.state.tags.length === 0 && <p>Please create a tag</p>}
  ```

### 10. Component Composition
- Create Counters component that renders multiple Counter components:
  ```javascript
  class Counters extends Component {
    state = {
      counters: [
        { id: 1, value: 4 },
        { id: 2, value: 0 },
        { id: 3, value: 0 },
        { id: 4, value: 0 }
      ]
    };
    
    render() {
      return (
        <div>
          {this.state.counters.map(counter => (
            <Counter 
              key={counter.id} 
              value={counter.value} 
              onIncrement={this.handleIncrement}
              onDelete={this.handleDelete}
            />
          ))}
        </div>
      );
    }
  }
  ```
- In Counter component, access props:
  ```javascript
  class Counter extends Component {
    state = {
      count: this.props.value    };
    
    render() {
      return (
        <div>
          <span className={this.getBadgeClasses()}>
            {this.formatCount()}
          </span>
          <button 
            onClick={this.handleIncrement} 
            className="btn btn-secondary btn-sm m-2"
          >
            Increment
          </button>
          <button             onClick={this.handleDelete}             className="btn btn-danger btn-sm m-2"
          >
            Delete
          </button>
        </div>
      );
    }
  }
  ```
- Children prop for passing content between opening/closing tags:
  ```javascript  // Parent
  <Counter>
    <h4>Counter Title</h4>
  </Counter>
  
  // Child
  class Counter extends Component {
    render() {
      return (
        <div>
          {this.props.children}
          {/* rest of component */}
        </div>
      );
    }
  }
  ```

### 11. Props vs State
- Props: Data passed to component (read-only, from parent)
  - Cannot be modified by component itself
  - Initializes component's behavior- State: Data managed within component (can change over time)
  - Private to component
  - Modified with setState()
- Rule: If data comes from parent via props and doesn't change, use props
  If data changes over time in response to user actions, use state

### 12. Raising and Handling Events- Child component raises event, parent handles it:
  ```javascript
  // In Counter component (child)
  <button 
    onClick={() => this.props.onDelete(this.props.id)} 
    className="btn btn-danger btn-sm m-2"
  >
    Delete  </button>
  
  // In Counters component (parent)
  handleDelete = (counterId) => {
    const counters = this.state.counters.filter(
      counter => counter.id !== counterId
    );
    this.setState({ counters });
  };
  ```
- Naming convention: Prefix event handlers with "on" (onDelete, onIncrement)
- Parent passes handler as prop: `onDelete={this.handleDelete}`
- Child invokes prop: `this.props.onDelete(id)`

### 13. Lifting State Up
- When multiple components need to share state, move state to closest common ancestor
- Example: Navigation bar needs to show total counters, but counters state is in Counters component
- Solution: Move state from Counters to App component (parent of both)
- App component state:
  ```javascript
  state = {
    counters: [
      { id: 1, value: 4 },
      { id: 2, value: 0 },
      { id: 3, value: 0 },
      { id: 4, value: 0 }
    ]
  };
  
  handleIncrement = (counter) => {
    const counters = [...this.state.counters];
    const index = counters.indexOf(counter);
    counters[index] = { ...counters[index], value: counter.value + 1 };
    this.setState({ counters });
  };
  ```
- Pass state and handlers down as props:
  ```javascript
  <Navbar totalCounters={this.getTotalCounters()} />
  <Counters 
    counters={this.state.counters}
    onIncrement={this.handleIncrement}
    onReset={this.handleReset}
    onDelete={this.handleDelete}
  />
  ```

### 14. Functional Components
- For simple components without state or lifecycle methods, use functional components:
  ```javascript
  const Navbar = (props) => {
    return (
      <nav className="navbar navbar-light bg-faded">
        <a className="navbar-brand" href="#">Navbar</a>
        <span className="badge badge-pill badge-secondary">
          {props.totalCounters}
        </span>
      </nav>
    );
  };
  
  export default Navbar;
  ```
- Alternative syntax with destructuring:
  ```javascript
  const Navbar = ({ totalCounters }) => (
    <nav className="navbar navbar-light bg-faded">
      <a className="navbar-brand" href="#">Navbar</a>
      <span className="badge badge-pill badge-secondary">
        {totalCounters}
      </span>
    </nav>
  );
  ```

### 15. Component Lifecycle
- Three main phases:
  1. Mounting: Component being created and inserted into DOM
     - constructor()
     - render()
     - componentDidMount()
  2. Updating: Component state or props changed
     - render()
     - componentDidUpdate()
  3. Unmounting: Component being removed from DOM
     - componentWillUnmount()
- Common lifecycle methods:
  - constructor(): Initialize state, bind event handlers
  - componentDidMount(): Fetch data, set up subscriptions
  - componentDidUpdate(): Respond to prop/state changes
  - componentWillUnmount(): Clean up (cancel requests, remove listeners)

## Important Examples

### Shopping Cart Application Pattern
Throughout the course, the instructor builds an application that mimics a shopping cart:
- Each row represents a product item
- Quantity can be incremented/decremented (with decrement disabled at zero)
- Delete button removes item from cart
- Reset button sets all quantities to zero
- Navigation bar shows count of items with quantity > 0
- This demonstrates real-world patterns for state management and component communication### Counter Component Evolution
1. Simple component with hardcoded "Hello World"
2. Added state to track count value
3. Added increment button with event handler
4. Added conditional styling based on count value
5. Extracted class calculation to separate method
6. Converted to receive initial value via props
7. Made controlled component (removed local state, relies on props)
8. Added delete functionality with event raising
9. Lifted state to parent component for shared data management

### State Lifting Example
- Initially: Counters component manages counters state
- Problem: Navbar needs access to counters data but isn't parent/child of Counters
- Solution: Move state from Counters to App component (common parent)
- App passes counters state and handler props down to both Navbar and Counters
- Navbar displays total count based on props
- Counters component receives counters and handlers as props
- When Counters needs to modify data, it calls handler prop which updates state in App
- App passes updated state down as props, keeping both components in sync

## Practical Takeaways
- Always use create-react-app for quick project setup (no configuration needed)
- Keep components small and focused on single responsibility
- Prefer functional components for presentational UI without state/lifecycle needs
- Use class components only when you need state or lifecycle methods
- Never modify state directly - always use setState()
- When state depends on previous state, use functional setState: `setState((prevState) => ({ ... }))`
- Always specify key prop when rendering lists of elements- Use React.Fragment (<>...</>) to avoid unnecessary div wrappers
- Lift state up when multiple components need to share the same data- Components should be either controlled (get data via props, notify via callbacks) or manage their own state
- Use PropTypes or TypeScript to validate props in larger applications
- Leverage React DevTools browser extension for debugging component hierarchies and state
- Follow naming conventions: on[Event] for event handlers, get[Value] for computed values
- When passing objects as props, spread operator helps create shallow copies: `const newObj = { ...oldObj }`
- For performance, avoid creating new objects/functions in render unless necessary
- Use destructuring to simplify accessing nested props: `const { value, id } = this.props.counter;`

## Quick Revision- React is a view library that uses Virtual DOM for efficient updates
- Components = reusable UI pieces with state and render method
- JSX = HTML-like syntax in JavaScript (compiled to React.createElement)
- State = mutable data managed by component (use setState to update)
- Props = immutable data passed from parent (read-only)
- Event handlers = camelCase names (onClick, onChange) passed as props
- Lists = map arrays to JSX elements, always include unique key prop
- Component composition = nesting components to build complex UIs
- State lifting = moving state to common ancestor when data needs sharing
- Controlled components = get data via props, communicate changes via callbacks
- Functional components = simpler syntax for stateless/presentational components- Lifecycle methods = constructor, render, componentDidMount, componentDidUpdate, componentWillUnmount

## Glossary
- **JSX**: JavaScript XML syntax that allows writing HTML-like code in JavaScript, which gets compiled to React.createElement calls
- **Virtual DOM**: Lightweight in-memory representation of the real DOM that React uses to minimize expensive DOM operations
- **Component**: Reusable, independent piece of UI that encapsulates markup, logic, and styling
- **State**: Mutable data managed within a component that triggers re-render when changed
- **Props**: Read-only data passed from parent component to child component
- **Controlled Component**: Component that receives its data via props and communicates changes back to parent via callback functions
- **Lifting State Up**: Pattern of moving state to a common ancestor component when multiple child components need to share the same data
- **React.Fragment**: Wrapper component that allows returning multiple elements without adding extra DOM nodes- **setState**: Asynchronous method used to update component state and trigger re-render
- **Lifecycle Hooks**: Special methods that run at different points in a component's life (mounting, updating, unmounting)
- **Functional Component**: Component defined as a function that returns JSX, simpler than class components for presentational UI
- **Key Prop**: Special prop used by React to identify which items have changed, are added, or are removed in a list
- **Event Handler**: Function passed as prop to handle user interactions (onClick, onChange, etc.)
- **Props Drilling**: Passing props through multiple levels of components (can be mitigated with Context API or state management libraries)