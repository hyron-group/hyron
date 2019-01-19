public class hello {

    public static void main(String ...args){
        if(args[1]=="say"){
            return new hello().say();
        }
    }

    public String say(){
        System.out.println("Hello world");
        return "say : hello";
    }
}