



export function RecievedMessages({content}: {content: string}){

    return <div className="bg-green-200 w-full max-w-60 px-4 py-2 rounded-lg">
       <h4> {content} </h4>
    </div>
}