import * as React from 'react'
import { useState } from 'react';

export default function Page404 () {
    const $test = useState(true);
    function testClick() {
        $test[1](!$test[0])
    }
    return (
        <div>
            <div className='test-css'>404 NOT FOUND
            <div onClick={testClick}>click: { $test[0] ? 'true' : 'false'}</div>
            </div>
        </div>
    );
}
