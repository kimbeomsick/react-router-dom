import {
  Outlet,
  Link,
  useLoaderData,
  NavLink,
  Form,
  redirect,
  useNavigation,
  useSubmit,
} from "react-router-dom";
import { getContacts, createContact } from "../contacts";
import { useEffect } from "react";

export async function action() {
  const contact = await createContact();
  return redirect(`/contacts/${contact.id}/edit`); // 할수를 실행시키는게 아닌 return 시켜줘야한다.
  //액션에서 페이지를 이동할 때 사용함
}

export default function Root() {
  const { contacts, q } = useLoaderData(); // loader함수로 생성한 데이터 불러오기
  const navigation = useNavigation();
  const submit = useSubmit();

  // url에 q가 있을때 input 창에 들어가게 한다.. default value는 유지되나봄
  useEffect(() => {
    document.getElementById("q").value = q;
  }, [q]);

  const searching =
    navigation.location &&
    new URLSearchParams(navigation.location.search).has("q");

  return (
    <>
      <div id="sidebar">
        <h1>React Router Contacts</h1>
        <div>
          <Form id="search-form" role="search">
            <input
              className={searching ? "loading" : ""}
              id="q"
              aria-label="Search contacts"
              placeholder="Search"
              type="search"
              name="q"
              defaultValue={q} // url 이 변경되어도 q값이 유지가 되는 기현상이 발생한다.
              onChange={(event) => {
                const isFirstSearch = q == null; // 첫번째 검색 결과가 아닌경우 검색결과를 교체합니다. 
                submit(event.currentTarget.form,{
                  replace: !isFirstSearch
                }); // 해당 form을 제출한다는 의미
              }}
            />
            <div id="search-spinner" aria-hidden hidden={!searching} />
            <div className="sr-only" aria-live="polite"></div>
          </Form>
          <Form method="post">
            <button type="submit">New</button>
          </Form>
        </div>
        <nav>
          {" "}
          {/* 가져온 데이터 화면에 그리기! */}
          {contacts.length ? (
            <ul>
              {contacts.map((contact) => (
                <li key={contact.id}>
                  <NavLink
                    to={`contacts/${contact.id}/?q=${q}`} //url이 변경되어도 사이드바가 유지될 수 있다.
                    className={(
                      { isActive, isPending } // 현재 링크가 활성화 되었는지 pending중인지 알 수 있다.
                    ) => (isActive ? "active" : isPending ? "pending" : "")}
                  >
                    {contact.first || contact.last ? (
                      <>
                        {contact.first} {contact.last}
                      </>
                    ) : (
                      <i>No Name</i>
                    )}{" "}
                    {contact.favorite && <span>★</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          ) : (
            <p>
              <i>No contacts</i>
            </p>
          )}
        </nav>
      </div>
      <div
        id="detail"
        className={navigation.state === "loading" ? "loading" : ""}
      >
        <Outlet />
      </div>
    </>
  );
}

//로더함수 생성
export async function loader({ request }) {
  //post는 formData로 가져오는 반면 get 요청은 url에서 가져오게 된다.
  const url = new URL(request.url); //url이 문자열로 되어있는데 그걸 객체로 변환해서 사용
  const q = url.searchParams.get("q"); // get함수를 사용해서 값을 가져옴 , 없을 경우 null이 뜬다.
  const contacts = await getContacts(q);
  return { contacts, q };
}
