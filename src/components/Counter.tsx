import './Counter.css'
import { useState, useEffect, useMemo } from 'react'
import { buttons, ButtonAudio } from './config'
import type { Stack } from './config'
const buttonAudio = new ButtonAudio()
export default function Counter() {

    const [stack, setStack] = useState([] as Stack) //响应式栈对象
    const [result, setResult] = useState(0)//计算结果
    const [activeMode, setActiveMode] = useState<'stack' | 'result'>('stack')
    const stackString = useMemo(() => stack.map(i => typeof i === 'number' ? (i < 0 ? `(${i})` : i) : i), [stack])
    const buttonCommitter = (button: typeof buttons[number], e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        buttonAudio.replayAudio()
        //动画
        const target = e.currentTarget as HTMLDivElement;
        target.classList.add('active');
        // 动画结束后移除类
        setTimeout(() => {
            target.classList.remove('active');
        }, 100);

        const [newStack, res, newActive] = button.handler(stack)
        setStack(newStack)
        setResult(res)
        setActiveMode(newActive)

    }
    useEffect(() => {
        // 栈对象更新，view重新渲染

        console.log('stack', stack)
        console.log('view重新渲染')
    }, [stack])

    useEffect(() => {
        // 初始化
        return () => {
            buttonAudio.pause()
        }
    }, [])

    return (
        <div className="Counter">
            <div className="view-outer">
                <div className='view'>
                    <div className={"stack " + `${activeMode === 'stack' ? 'active' : ''}`}>{stackString}</div>
                    <div className={"result " + `${activeMode === 'result' ? 'active' : ''}`}>{result.toLocaleString(undefined, {
                        maximumFractionDigits: 9 // 限制小数部分最多5位
                    })}</div>
                </div>
            </div>
            <div className="buttons">{buttons.map(i => <div className={'button ' + i.className} key={i.text} onClick={(e) => buttonCommitter(i, e)}>{i.text}</div>)}</div>
        </div>
    )
}