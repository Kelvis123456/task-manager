# Task Manager

A task manager web app built with vanilla HTML, CSS, and JavaScript — no framework — using a component-based architecture with an event bus for state changes.

## Features

- Create, edit, complete, and delete tasks
- Search and filter tasks
- Live stats (completed/pending counts, etc.)
- Toast notifications for user feedback
- LocalStorage persistence

## Architecture

```
js/
├─ components/   — TaskCard, TaskList, TaskForm, Modal, Search, Filters, Stats, Toast
├─ models/       — Task
├─ services/     — TaskService (business logic), StorageService (persistence)
├─ utils/        — date, filters, stats, validators
├─ eventBus.js   — pub/sub event bus components use to react to state changes
└─ app.js        — wires everything together
```

Presentation (`components/`), business logic (`services/`), and data (`models/`) are kept in separate layers, connected through the event bus rather than direct references — a lightweight take on a component architecture without a framework.

## Testing

Jest + jsdom, with unit tests for services, models, and utils:

```
npm install
npm test
```

## Running it

Open `index.html` in a browser — no build step required.
