Dropzone.autoDiscover = false;

function init() {
  let dz = new Dropzone("#dropzone", {
    url: "/file-upload", // Ensure this URL matches your server endpoint
    maxFiles: 1,
    addRemoveLinks: true,
    dictDefaultMessage: "Drop files here or click to upload",
    autoProcessQueue: false,
    success: function (file) {
      // Do nothing on success
    },
    error: function (file) {
      // Do nothing on error
    },
  });

  // Remove the first file if a second file is added
  dz.on("addedfile", function () {
    if (dz.files[1] != null) {
      dz.removeFile(dz.files[0]);
    }
  });

  // Process the queue when the submit button is clicked
  $("#submitBtn").on("click", function (e) {
    e.preventDefault(); // Prevent the default form submission
    dz.processQueue();
  });

  // Handle the completion of the file upload
  dz.on("complete", function (file) {
    let imageData = file.dataURL;

    var url = "http://127.0.0.1:5000/classify_image"; // Ensure this is the correct endpoint

    // Send the image data to the server for classification
    $.post(url, { image_data: imageData }, function (data, status) {
      console.log(data);

      // Check for empty data response
      if (!data || data.length == 0) {
        $("#resultHolder").hide();
        $("#divClassTable").hide();
        $("#error").show();
        return; // Exit early if no data
      }

      let match = null;
      let bestScore = -1;

      // Find the class with the highest score
      for (let i = 0; i < data.length; ++i) {
        let maxScoreForThisClass = Math.max(...data[i].class_probability);

        if (maxScoreForThisClass > bestScore) {
          match = data[i];
          bestScore = maxScoreForThisClass;
        }
      }

      // Update the UI with the classification result
      if (match) {
        $("#error").hide();
        $("#resultHolder").show();
        $("#divClassTable").show();

        // Corrected selector to get the HTML of the matching class
        $("#resultHolder").html($(`[data-player="${match.class}"]`).html());

        let classDictionary = match.class_dictionary;

        for (let personName in classDictionary) {
          let index = classDictionary[personName];

          let probabilityScore = match.class_probability[index];

          let elementName = "#score_" + personName;
          $(elementName).html(probabilityScore);
        }
      }
    });
  });
}

// Document ready function to initialize the script
$(document).ready(function () {
  console.log("ready!");
  $("#error").hide();
  $("#resultHolder").hide();
  $("#divClassTable").hide();

  init(); // Initialize Dropzone
});
