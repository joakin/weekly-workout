// Generated by ReScript, PLEASE EDIT WITH CARE

import * as React from "react";
import * as NumberRange from "../../data/NumberRange.res.mjs";
import * as JsxRuntime from "react/jsx-runtime";

import './exercise-list.css';
;

function ExerciseList$ExerciseContainer(props) {
  var children = props.children;
  var isSuperset = props.isSuperset;
  var className = "exercise-item" + (
    isSuperset ? " superset" : ""
  );
  if (isSuperset) {
    return JsxRuntime.jsx("li", {
                children: children,
                className: className
              });
  } else {
    return JsxRuntime.jsx("div", {
                children: children,
                className: className
              });
  }
}

var ExerciseContainer = {
  make: ExerciseList$ExerciseContainer
};

function make(props) {
  var __isSuperset = props.isSuperset;
  var exercise = props.exercise;
  var isSuperset = __isSuperset !== undefined ? __isSuperset : false;
  var name = isSuperset ? "Superset: " + exercise.name : exercise.name;
  var sets = NumberRange.formatRange(exercise.sets);
  var reps = NumberRange.formatRange(exercise.reps);
  var notes = exercise.notes;
  var superset = exercise.superset;
  return JsxRuntime.jsxs(ExerciseList$ExerciseContainer, {
              isSuperset: isSuperset,
              children: [
                JsxRuntime.jsx("div", {
                      children: name,
                      className: "exercise-name"
                    }),
                JsxRuntime.jsxs("div", {
                      children: [
                        sets,
                        " sets × ",
                        reps
                      ],
                      className: "exercise-sets"
                    }),
                notes !== undefined ? JsxRuntime.jsx("div", {
                        children: JsxRuntime.jsx("span", {
                              children: (
                                isSuperset ? "★" : "ℹ"
                              ) + " " + notes
                            }),
                        className: "exercise-notes"
                      }) : null,
                superset !== undefined ? React.createElement(make, {
                        exercise: superset,
                        isSuperset: true
                      }) : null
              ]
            });
}

var ExerciseElement = {
  make: make
};

function ExerciseList(props) {
  return JsxRuntime.jsx("ul", {
              children: props.exercises.map(function (exercise) {
                    return JsxRuntime.jsx(make, {
                                exercise: exercise
                              }, exercise.name);
                  }),
              className: "exercise-list"
            });
}

var make$1 = ExerciseList;

export {
  ExerciseContainer ,
  ExerciseElement ,
  make$1 as make,
}
/*  Not a pure module */
