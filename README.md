# Programmers' Calculator

A calculator that gives the same results a typical programming language would; limited range, rounding errors, two's complement integers, IEEE floating point, all with the base conversions real programmers need.

The floating point and 8/16/32-bit operators are mostly implemented with Javascript primitives. 64-bit requires more effort, but has been coded for simplicity, not speed.

[Find it online here](https://a-m-s.github.io/progcalc/).

## Instructions

Unlike most calculators there's not just one input field here. You can create as many input "variables" as you like. they will be named "A", "B", "C", and so on. Each input variable has a fixed bit-width that cannot be changed, once created, but you can choose what size to create.

Input variables may be edited by typing into any one of the numeric fields. Which field you choose determines the input radix and type (integer versus float). You may enter negative values into any field, but the hexadecimal, octal, unsigned decimal, and binary fields will automatically show the unsigned value when you hit enter or the leaves the field. If the field border changes to orange then the value will be rounded or truncated to fit the variable, or parse errors discarded, and the other fields will show the modified value in real time.

Calculations are performed by selecting a "left" operand, for unary operators, or both "left" and "right" operators, for binary operators, then clicking on an operator button. A new output variable will be created with the correct output bit-width and result value. Output variables are read-only -- the field border will go grey if you attempt to edit one -- but will update in real time if the input variables are edited. Chains of calculations may be arbitrarily long.

Selecting a bare unsuffixed operator will interpret a variable as an integer. Selecting an "fp" operator will interpret the variable as floating point (only available for 32-bit and 64-bit variables). There's no rule that the output variable must be used as integer or floating point. The bit patterns may be reinterpreted freely, although whether that makes sense is up to you.

## Known limitations

* Not many operators are implemented yet!
* The green/orange indicator isn't perfect.
* It's not yet possible to convert between bit-widths.
* Javascript has some floating point behaviour that differs from other languages.
