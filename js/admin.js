const roomForm = document.querySelector("#room-form");
const roomsList = document.querySelector("#rooms-list");

const searchInput = document.querySelector("#search");
const statusFilter = document.querySelector("#status-filter");

const formTitle = document.querySelector("#form-title");
const saveButton = document.querySelector("#save-button");
const cancelButton = document.querySelector("#cancel-edit");

const formMessage = document.querySelector("#form-message");
const pageMessage = document.querySelector("#page-message");

const roomName = document.querySelector("#room-name");
const roomNumber = document.querySelector("#room-number");
const roomType = document.querySelector("#room-type");
const roomPrice = document.querySelector("#room-price");
const roomCapacity = document.querySelector("#room-capacity");
const roomStatus = document.querySelector("#room-status");
const roomDescription = document.querySelector("#room-description");

const storageKey = "disneyHotelRooms";

const statusLabels = {
  available: "Available",
  occupied: "Occupied",
  maintenance: "Maintenance"
};

const allowedTypes = ["Classic", "Deluxe", "Family", "Suite"];

let rooms = [];
let editingId = null;
let storageReady = true;



try {
  const savedRooms = localStorage.getItem(storageKey);

  if (savedRooms !== null) {
    const data = JSON.parse(savedRooms);

    // Kontrollon strukturen para perdorimit
    const validData = Array.isArray(data) && data.every(function (room) {
      return (
        room !== null &&
        typeof room === "object" &&
        typeof room.id === "string" &&
        typeof room.name === "string" &&
        typeof room.number === "string" &&
        allowedTypes.includes(room.type) &&
        Number.isFinite(room.price) &&
        room.price >= 1 &&
        room.price <= 100000 &&
        Number.isInteger(room.capacity) &&
        room.capacity >= 1 &&
        room.capacity <= 20 &&
        Object.hasOwn(statusLabels, room.status) &&
        typeof room.description === "string"
      );
    });

    if (!validData) {
      throw new Error("Invalid saved rooms");
    }

    rooms = data;
  }
} catch (error) {
  storageReady = false;
  showPageMessage(
    "Saved rooms could not be loaded. Changes are disabled to protect existing data.",
    true
  );
}


function showPageMessage(text, isError = false) {
  pageMessage.textContent = text;
  pageMessage.classList.toggle("error", isError);
}

function saveRooms(updatedRooms) {
  if (!storageReady) {
    showPageMessage("Room storage is unavailable.", true);
    return false;
  }

  try {
    localStorage.setItem(storageKey, JSON.stringify(updatedRooms));
    rooms = updatedRooms;
    return true;
  } catch (error) {
    showPageMessage(
      "The change could not be saved. Check browser storage permissions or available space.",
      true
    );

    return false;
  }
}



function updateStatistics() {
  document.querySelector("#total-rooms").textContent = rooms.length;

  document.querySelector("#available-rooms").textContent =
    rooms.filter(function (room) {
      return room.status === "available";
    }).length;

  document.querySelector("#occupied-rooms").textContent =
    rooms.filter(function (room) {
      return room.status === "occupied";
    }).length;

  document.querySelector("#maintenance-rooms").textContent =
    rooms.filter(function (room) {
      return room.status === "maintenance";
    }).length;
}

function addCell(row, text) {
  const cell = document.createElement("td");
  cell.textContent = text;
  row.appendChild(cell);
  return cell;
}

function renderRooms() {
  roomsList.replaceChildren();

  const search = searchInput.value.trim().toLowerCase();
  const selectedStatus = statusFilter.value;

  const filteredRooms = rooms.filter(function (room) {
    const matchesSearch =
      room.name.toLowerCase().includes(search) ||
      room.number.toLowerCase().includes(search);

    const matchesStatus =
      selectedStatus === "all" ||
      room.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  filteredRooms.forEach(function (room) {
    const row = document.createElement("tr");

    // Emri dhe numri
    const nameCell = document.createElement("td");

    const name = document.createElement("strong");
    name.className = "room-name";
    name.textContent = room.name;

    const number = document.createElement("span");
    number.className = "room-number";
    number.textContent = "Room " + room.number;

    nameCell.append(name, number);
    row.appendChild(nameCell);

    addCell(row, room.type);
    addCell(row, "€" + room.price.toFixed(2));
    addCell(row, room.capacity);

    // Statusi
    const statusCell = document.createElement("td");
    const badge = document.createElement("span");

    badge.className = "badge " + room.status;
    badge.textContent = statusLabels[room.status];

    statusCell.appendChild(badge);
    row.appendChild(statusCell);

    // Butonat Edit dhe Delete
    const actionsCell = document.createElement("td");
    const actions = document.createElement("div");
    actions.className = "actions";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "action-button";
    editButton.textContent = "Edit";
    editButton.setAttribute(
      "aria-label",
      "Edit room " + room.number
    );

    editButton.addEventListener("click", function () {
      editRoom(room.id);
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "action-button delete";
    deleteButton.textContent = "Delete";
    deleteButton.setAttribute(
      "aria-label",
      "Delete room " + room.number
    );

    deleteButton.addEventListener("click", function () {
      deleteRoom(room.id);
    });

    actions.append(editButton, deleteButton);
    actionsCell.appendChild(actions);
    row.appendChild(actionsCell);

    roomsList.appendChild(row);
  });

  const emptyState = document.querySelector("#empty-state");
  emptyState.hidden = filteredRooms.length > 0;

  emptyState.textContent = rooms.length === 0
    ? "No rooms yet. Add your first room using the form."
    : "No rooms match your search or selected status.";

  document.querySelector("#room-count").textContent =
    filteredRooms.length + " rooms shown";

  updateStatistics();
}


roomForm.addEventListener("submit", function (event) {
  event.preventDefault();
  formMessage.textContent = "";

  const name = roomName.value.trim();
  const number = roomNumber.value.trim();
  const price = Number(roomPrice.value);
  const capacity = Number(roomCapacity.value);

  if (name === "" || number === "") {
    formMessage.textContent = "Enter a room name and number.";
    return;
  }

  if (
    !Number.isFinite(price) ||
    price < 1 ||
    price > 100000 ||
    !Number.isInteger(capacity) ||
    capacity < 1 ||
    capacity > 20 ||
    !allowedTypes.includes(roomType.value) ||
    !Object.hasOwn(statusLabels, roomStatus.value)
  ) {
    formMessage.textContent = "Please check the room details.";
    return;
  }

  // Numri i dhomes duhet te jete unik
  const numberExists = rooms.some(function (room) {
    return (
      room.number.toLowerCase() === number.toLowerCase() &&
      room.id !== editingId
    );
  });

  if (numberExists) {
    formMessage.textContent = "This room number already exists.";
    roomNumber.focus();
    return;
  }

  const wasEditing = editingId !== null;

  const room = {
    id: editingId || crypto.randomUUID(),
    name: name,
    number: number,
    type: roomType.value,
    price: price,
    capacity: capacity,
    status: roomStatus.value,
    description: roomDescription.value.trim()
  };

  let updatedRooms;

  if (wasEditing) {
    updatedRooms = rooms.map(function (existingRoom) {
      return existingRoom.id === editingId ? room : existingRoom;
    });
  } else {
    updatedRooms = [...rooms, room];
  }

  if (!saveRooms(updatedRooms)) {
    return;
  }

  // Shfaq dhomen e saporuajtur edhe nese kishte filtra
  searchInput.value = "";
  statusFilter.value = "all";

  resetForm();
  renderRooms();

  showPageMessage(
    wasEditing
      ? "Room updated successfully."
      : "Room added successfully."
  );
});

function editRoom(id) {
  const room = rooms.find(function (room) {
    return room.id === id;
  });

  if (!room) {
    return;
  }

  editingId = id;

  roomName.value = room.name;
  roomNumber.value = room.number;
  roomType.value = room.type;
  roomPrice.value = room.price;
  roomCapacity.value = room.capacity;
  roomStatus.value = room.status;
  roomDescription.value = room.description;

  formTitle.textContent = "Edit Room";
  saveButton.textContent = "Save Changes";
  cancelButton.hidden = false;
  formMessage.textContent = "";

  document.querySelector("#room-editor").scrollIntoView({
    block: "start"
  });

  roomName.focus({ preventScroll: true });
}

function deleteRoom(id) {
  const room = rooms.find(function (room) {
    return room.id === id;
  });

  if (!room) {
    return;
  }

  const confirmed = window.confirm(
    'Delete room "' + room.name + '" (' + room.number + ')?'
  );

  if (!confirmed) {
    return;
  }

  const updatedRooms = rooms.filter(function (room) {
    return room.id !== id;
  });

  if (!saveRooms(updatedRooms)) {
    return;
  }

  if (editingId === id) {
    resetForm();
  }

  renderRooms();
  showPageMessage("Room deleted successfully.");
}

/* =========================
   PASTRIMI I FORMULARIT
========================= */

function resetForm() {
  editingId = null;

  roomForm.reset();
  formTitle.textContent = "Add a Room";
  saveButton.textContent = "Save Room";
  cancelButton.hidden = true;
  formMessage.textContent = "";
}

cancelButton.addEventListener("click", resetForm);

document.querySelector("#new-room-button").addEventListener(
  "click",
  function () {
    resetForm();

    document.querySelector("#room-editor").scrollIntoView({
      block: "start"
    });

    roomName.focus({ preventScroll: true });
  }
);


searchInput.addEventListener("input", renderRooms);
statusFilter.addEventListener("change", renderRooms);

roomForm.addEventListener("input", function () {
  formMessage.textContent = "";
});

// Shfaq te dhenat kur hapet faqja
renderRooms();