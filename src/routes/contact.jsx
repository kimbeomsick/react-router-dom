import { Form, useFetcher, useLoaderData } from "react-router-dom";
import { getContact, updateContact } from "../contacts";

export default function Contact() {
  const { contact } = useLoaderData();

  return (
    <div id="contact">
      <div>
        <img key={contact.avatar} src={contact.avatar || null} />
      </div>

      <div>
        <h1>
          {contact.first || contact.last ? (
            <>
              {contact.first} {contact.last}
            </>
          ) : (
            <i>No Name</i>
          )}{" "}
          <Favorite contact={contact} />
        </h1>

        {contact.twitter && (
          <p>
            <a target="_blank" href={`https://twitter.com/${contact.twitter}`}>
              {contact.twitter}
            </a>
          </p>
        )}

        {contact.notes && <p>{contact.notes}</p>}

        <div>
          <Form action="edit">
            <button type="submit">Edit</button>
          </Form>
          <Form
            method="post"
            action="destroy"
            onSubmit={(event) => {
              if (
                // eslint-disable-next-line no-restricted-globals
                !confirm("Please confirm you want to delete this record.")
              ) {
                event.preventDefault();
              }
            }}
          >
            <button type="submit">Delete</button>
          </Form>
        </div>
      </div>
    </div>
  );
}

function Favorite({ contact }) {
  const fetcher = useFetcher();
  // yes, this is a `let` for later
  let favorite = contact.favorite; // 좋아요 눌렀는지 아닌지 => loader에서 가져온다. 
  // console.log(fetcher)

  
  //왜 이걸 사용하는게 더 빠를까?
  if(fetcher.formData){
    console.log(fetcher.state);
    favorite = fetcher.formData.get("favorite") === "true"; // 이게 뭐지? 뭔데 이걸먼저 사용하지..? 페이지 변하기 전까지는 어림없었잖아!
  }

  return (
    <fetcher.Form method="post">
      <button
        name="favorite" //formData를 위한 이름 설정
        value={favorite ? "false" : "true"} // 버튼에 따른 값 변경
        aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
      >
        {favorite ? "★" : "☆"}
      </button>
    </fetcher.Form>
  );
}

export async function action({ request, params }) {
  let formData = await request.formData(); //데이터 출력
  return updateContact(params.contactId, {
    //요청 전송  왜 궅이 함수로 리턴해야할까..? 킹받네
    favorite: formData.get("favorite") === "true",
  });
}

export async function loader({ params }) {
  const contact = await getContact(params.contactId);
  if(!contact){
    throw new Response("", {   //구체적인 커스텀 에러를 생성해서 반환할 수 있다. 
      status:404,
      statusText:`custom error page Not Found`
    })
  }
  return { contact };
}
