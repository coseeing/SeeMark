/*************************************************************************
 *
 *  direct/tex2mml
 *
 *  Uses MathJax v3 to convert a TeX string to a MathML string.
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

//
//  Load the packages needed for MathJax
//
import { TeX } from 'mathjax-full/js/input/tex';
import { HTMLDocument } from 'mathjax-full/js/handlers/html/HTMLDocument';
import { liteAdaptor } from 'mathjax-full/js/adaptors/liteAdaptor';
import { STATE } from 'mathjax-full/js/core/MathItem';

import { AllPackages } from 'mathjax-full/js/input/tex/AllPackages.js';

//
//  Busproofs requires an output jax, which we aren't using
//
// const packages = AllPackages.filter((name) => name !== "bussproofs");

//
//  Create the input jax
//
// const tex = new TeX({packages: argv.packages.split(/\s*,\s*/)});
const tex = new TeX({
  packages: AllPackages.filter((name) => name !== 'bussproofs').sort(),
});

//
//  Create an HTML document using a LiteDocument and the input jax
//
const html = new HTMLDocument('', liteAdaptor(), { InputJax: tex });

//
//  Create a MathML serializer
//
import { SerializedMmlVisitor } from 'mathjax-full/js/core/MmlTree/SerializedMmlVisitor.js';
const visitor = new SerializedMmlVisitor();
const toMathML = (node) => visitor.visitTree(node, html);

const texToMMLFactory =
  ({ htmlMathDisplay }) =>
  (mstring) => {
    return toMathML(
      html.convert(mstring || '', {
        display: htmlMathDisplay === 'block',
        end: STATE.CONVERT,
      })
    );
  };
export default texToMMLFactory;
