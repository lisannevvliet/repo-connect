// Return the Element object of the corresponding element.
function $(element) {
    return document.querySelector(element)
}

// Submit the form upon a change in the year dropdown.
$("#year").onchange = function() {
    $("#form").submit()
}