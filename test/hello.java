public class hello implements DemoAPI {

    public static requestConfig(){
        return Demo;
    }

    public String sayHi(String name) {
        return "hi : " + name;
    }

    public String helloWorld() {
        return "hello world";
    }
}

public interface DemoAPI {
    @Method("get")
    String sayHi(String name);
    
    @Method({"get", "post"})
    String helloWorld(); 
}