/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 计算器控制器模型配置
 * 自行传入stack,setStack
 * stack:string[] 待计算的式子列表
 */
export type Stack = (number | string)[];
type Button = {
    text: string;
    className: string;
    value: number;
    handler: (_: Stack) => ReturnType<typeof pushInStack>;
};

/*> ----    stack操作辅助函数  ----<*/
//输入类型
enum PushType {
    NUMBER = 'number',
    OPERATOR = 'operator',
    DOT = 'dot',
    EQUAL = 'equal',
    CLEAR = 'clear',
    CHANGE = 'change',
    PERCENT = 'percent'
}
type PushEffectTree = {
    [key in ('number' | 'string' | 'empty')]: {
        [key in PushType]: (a: Stack, b: string | number | undefined, c: string | number) => void
    }
}

function switchSign(stack: Stack, top: string | number | undefined, value: string | number) {

    if (top === ')') {
        //去除-号
        for (let i = stack.length - 1; i >= 0; i--) {
            if (!(typeof stack[i] === 'number' || ['-', '(', ')', '.'].includes(stack[i] as string)) || stack[i] === '(') {
                //在(的位置暂停，删除左括号和-号
                stack.splice(i, 2)
                //)的index位置
                const RightIndex = stack.lastIndexOf(')');
                //删除右括号
                stack.splice(RightIndex, 1)
                break;
            }
        }
    } else if (typeof top === 'number' || top === '.') {
        //向前找到数字和逗号结束的位置，插入-号
        for (let i = stack.length - 1; i >= 0; i--) {
            if (!(typeof stack[i] === 'number' || stack[i] === '.')) {
                stack.splice(stack.length, 0, ')')
                stack.splice(i + 1, 0, '(', '-')
                break;
            }
        }
    }




}
const pushEffectTree: PushEffectTree = {
    'number': {
        [PushType.NUMBER]: (stack, top, value) => {
            //不再做输入过程中的数字合并
            stack.push(value)
        },
        [PushType.OPERATOR]: (stack, top, value) => { stack.push(value); },
        [PushType.DOT]: (stack, top, value) => {
            //第一个符号是逗号的话不操作
            for (let i = stack.length - 1; i >= 0; i--) {
                if (typeof stack[i] === 'string') {
                    if (stack[i] !== '.') {
                        stack.push(value)
                    }
                    return;
                }
            }
            //没有逗号
            stack.push(value)
        },
        [PushType.EQUAL]: (stack, top, value) => { },
        [PushType.CLEAR]: (stack, top, value) => { stack.splice(0, stack.length) },
        [PushType.CHANGE]: switchSign,
        [PushType.PERCENT]: (stack, top, value) => { stack.push(value) },

    },
    'string': {
        [PushType.NUMBER]: (stack, top, value) => {
            stack.push(value);
        },
        [PushType.OPERATOR]: (stack, top, value) => {

            if (['+', '-', '×', '÷'].includes(top as string)) {
                if (stack.length === 1 && ['×', '÷'].includes(value as string)) {
                    // 栈首不允许添加乘除号
                    return;
                } else {
                    stack[stack.length - 1] = value;
                }

            }
            // else if (top === '.') {
            //     stack.push(0, value);
            // }
            else {
                stack.push(value);
            }
        },
        [PushType.DOT]: (stack, top, value) => {
            if (['+', '-', '×', '÷'].includes(top as string)) {
                stack.push(0, value);
            }
        },
        [PushType.EQUAL]: (stack, top, value) => { },
        [PushType.CLEAR]: (stack, top, value) => { stack.splice(0, stack.length) },
        [PushType.CHANGE]: switchSign,
        [PushType.PERCENT]: (stack, top, value) => { if (['%', ')'].includes(top as string)) stack.push(value) },
    },
    'empty': {
        [PushType.NUMBER]: (stack, top, value) => {
            stack.push(value)
        },
        [PushType.OPERATOR]: (stack, top, value) => { if (['+', '-'].includes(value as string)) { stack.push(value) } },
        [PushType.DOT]: (stack, top, value) => { stack.push(0, value) },
        [PushType.EQUAL]: (stack, top, value) => { },
        [PushType.CLEAR]: (stack, top, value) => { },
        [PushType.CHANGE]: (stack, top, value) => { },
        [PushType.PERCENT]: (stack, top, value) => { },

    },
} as const;

function pushInStack(stack: Stack, value: number | string, pushType: PushType): [Stack, number, 'result' | 'stack'] {

    if (stack.length > 0) {
        //先判断栈顶元素
        const top = stack[stack.length - 1];
        const typeOfTop = typeof top as (keyof PushEffectTree);
        pushEffectTree[typeOfTop][pushType](stack, top, value)
    } else {
        //栈顶无元素
        pushEffectTree['empty'][pushType](stack, undefined, value)
    }
    const result = calculate([...stack])
    const activeMode = pushType === PushType.EQUAL ? 'result' : 'stack'
    return [[...stack], result, activeMode]
}
/*> -------------------------<*/

/*> ----    结果计算辅助函数  ----<*/
//全边界条件实例 [1, '.', 3, '+', 3, '+', 0, '.', 3, '-', 0, '.', 6, '×', 0, '.', 7, '÷', 0, '.', 8, '%', '×', '(', '-', 0, '.', 6, ')', '%', '%', '%']
//全边界条件实例 
// const stack = ['+', 1, '.', 3, '+', 3, '+', 0, '.', 3, '-', 0, '.', 6, '×', 0, '.', 7, '÷', 0, '.', 8, '%', '×', '(', '-', 0, '.', 6, ')', '%', '%', '%', '+', 3, '+']
function concatSingleNumber(stack: Stack) {
    // 双指针
    let left = 0;
    let right = left;
    //滑动窗口
    while (right < stack.length + 1) {

        if (typeof stack[right] === 'number' || ['.', '(', ')', '%'].includes(stack[right] as string)) {
            if (['(', ')'].includes(stack[right] as string)) {
                //清除括号( )
                // console.log('遭遇括号', stack[right])
                //)括号后面是数字时插入乘号
                if (stack[right + 1] !== undefined && typeof stack[right + 1] === 'number') {
                    stack.splice(right, 1, '×')
                } else {
                    stack.splice(right, 1)
                }

            } else {
                right++;
            }

        } else {
            if (left != right) {
                console.log('第一个单独数字队列', left, right, stack.slice(left, right))
                const num = _mergeNumber(stack.slice(left, right))
                stack.splice(left, right - left, num)
                right = right - (right - left);
            }
            left = right + 1;
            right = left;
            // return
        }
        // console.log('stack', stack)
    }
    return stack
}
//[ 0, '.', 6, '%', '%', '%' ]
function _mergeNumber(arr: Stack) {
    let latNumberIndex = -1;
    for (let i = 0; i < arr.length; i++) {
        if (typeof arr[i] === 'number') {
            latNumberIndex = i
        }
    }
    let result = 0
    if (latNumberIndex != -1) {
        const str = arr.slice(0, latNumberIndex + 1).join('');
        let num = parseFloat(str);
        console.log('num', num)
        let percentCount = 0;
        arr.forEach(item => {
            if (item === '%') {
                percentCount++
            }
        })
        num = num / (100 ** percentCount)
        result = num
    }
    console.log('result', result)
    return result
}
// _mergeNumber([0, '.', 6, '%', '%', '%'])
// concatSingleNumber(stack)
const _runTree = {
    '+': function (a: number, b: number) { return a + b },
    '-': function (a: number, b: number) { return a - b },
    '×': function (a: number, b: number) { return a * b },
    '÷': function (a: number, b: number) { return a / b },
} as const
//处理乘除
function clearMulDiv(stack: Stack) {
    let index = 0
    while (index < stack.length) {
        if (['×', '÷'].includes(stack[index] as string)) {
            const num1 = stack[index - 1];
            const num2 = stack[index + 1];
            if (num1 && num2) {
                if (typeof num1 === 'number' && typeof num2 === 'number') {
                    const res = _runTree[stack[index] as keyof typeof _runTree](num1, num2)
                    console.log('res', res, index, index)
                    index = index - 1;
                    stack.splice(index, 3, res)
                } else if (typeof num1 === 'number' && typeof num2 != 'number') {
                    const num2_1 = stack[index + 2];
                    const sign = stack[index + 1];
                    const res = _runTree[stack[index] as keyof typeof _runTree](num1, num2_1 as number)
                    index = index - 1;
                    stack.splice(index, 4, sign, res)
                }
            }
        }
        index++;
    }
    return stack
}

// const _stack = [
//     '+', 1.3, '+', 3,
//     '+', 0.3, '-', 0.6,
//     '×', 0.7, '÷', 0.008,
//     '×', '-', 6e-7, '+',
//     3, '+'
// ];
// clearMulDiv(_stack)

//处理+ - 符号
function calculateSum(stack: Stack) {
    let sum = 0;
    let isPlus = true;
    while (stack.length > 0) {
        const top = stack.shift();
        if (typeof top === 'number') {
            sum = isPlus ? sum + top : sum - top;
            isPlus = true;
        } else {
            isPlus = top === '+' ? isPlus : !isPlus;
        }
    }
    console.log('sum', sum);
    return sum;
}
// calculateSum(['+', 1.3, '-', 0.3, '+',
//     '-', 0.3])
function calculate(stack: Stack) {
    //先将分散的数字合并 数字 . % 括号 + -
    const a = concatSingleNumber(stack)
    console.log('a', a);
    const b = clearMulDiv(a);
    const res = calculateSum(b);
    console.log('res', res);
    return res;
}
/*> -----------------------------<*/



/*> ----    添加按键音频  ----<*/


export class ButtonAudio {
    audio: HTMLAudioElement;
    replayAudio: () => void;
    pause: () => void;
    constructor() {
        this.audio = new Audio('/button.MP3')
        this.replayAudio = () => {
            this.audio.currentTime = 0; // 重置播放位置
            this.audio.play().catch(e => console.error("播放失败:", e));
        }
        this.pause = () => {
            this.audio.pause()
        }
    }

}

/*> -----------------------------<*/



export const buttons: Button[] = [
    {
        text: "C",
        className: "button-color1",
        value: 0,
        handler(stack) { return pushInStack(stack, this.text, PushType.CLEAR) },
    }, //清空计算栈
    {
        text: "+/-", className: "button-color1", value: 0, handler(stack) {
            return pushInStack(stack, this.text, PushType.CHANGE)
        }
    }, //
    { text: "%", className: "button-color1", value: 0, handler(stack) { return pushInStack(stack, this.text, PushType.PERCENT) } }, //
    { text: "÷", className: "button-color2", value: 0, handler(stack) { return pushInStack(stack, this.text, PushType.OPERATOR) } }, //
    { text: "7", className: "button-color3", value: 7, handler(stack) { return pushInStack(stack, this.value, PushType.NUMBER) } }, //
    { text: "8", className: "button-color3", value: 8, handler(stack) { return pushInStack(stack, this.value, PushType.NUMBER) } }, //
    { text: "9", className: "button-color3", value: 9, handler(stack) { return pushInStack(stack, this.value, PushType.NUMBER) } }, //
    { text: "×", className: "button-color2", value: 0, handler(stack) { return pushInStack(stack, this.text, PushType.OPERATOR) } }, //
    { text: "4", className: "button-color3", value: 4, handler(stack) { return pushInStack(stack, this.value, PushType.NUMBER) } }, //
    { text: "5", className: "button-color3", value: 5, handler(stack) { return pushInStack(stack, this.value, PushType.NUMBER) } }, //
    { text: "6", className: "button-color3", value: 6, handler(stack) { return pushInStack(stack, this.value, PushType.NUMBER) } }, //
    { text: "-", className: "button-color2", value: 0, handler(stack) { return pushInStack(stack, this.text, PushType.OPERATOR) } }, //
    { text: "1", className: "button-color3", value: 1, handler(stack) { return pushInStack(stack, this.value, PushType.NUMBER) } }, //
    { text: "2", className: "button-color3", value: 2, handler(stack) { return pushInStack(stack, this.value, PushType.NUMBER) } }, //
    { text: "3", className: "button-color3", value: 3, handler(stack) { return pushInStack(stack, this.value, PushType.NUMBER) } }, //
    { text: "+", className: "button-color2", value: 0, handler(stack) { return pushInStack(stack, this.text, PushType.OPERATOR) } }, //
    {
        text: "0",
        className: "button-color3 button-span",
        value: 0,
        handler(stack) { return pushInStack(stack, this.value, PushType.NUMBER) },
    }, //
    { text: ".", className: "button-color3", value: 0, handler(stack) { return pushInStack(stack, this.text, PushType.DOT) } }, //
    { text: "=", className: "button-color2", value: 0, handler(stack) { return pushInStack(stack, this.text, PushType.EQUAL) } }, //
];


