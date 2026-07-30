/*************************************************************************
 *
 *  direct/am2mml
 *
 *  Uses MathJax v3 to convert an AsciiMath string to a MathML string.
 *
 * ----------------------------------------------------------------------
 *
 *  Copyright (c) 2018 The MathJax Consortium
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

// MathJax's AsciiMath modules are loaded lazily, on the first conversion —
// see load-asciimath.cjs for why (its legacy shim crashes ESM-strict
// bundlers at import time).
import loadAsciimathRuntime from './load-asciimath.cjs';

const asciiMathToMMLFactory =
  ({ htmlMathDisplay }) =>
  (mstring) => {
    const { html, STATE, toMathML } = loadAsciimathRuntime();
    return toMathML(
      html.convert(mstring || '', {
        display: htmlMathDisplay === 'block',
        end: STATE.CONVERT,
      })
    );
  };

export default asciiMathToMMLFactory;
